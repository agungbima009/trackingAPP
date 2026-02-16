<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LocationModel;
use App\Models\TakenTaskModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    /**
     * Store a new location record
     * Can be called automatically by the mobile app or manually
     */
    public function store(Request $request)
    {
        $request->validate([
            'taken_task_id' => 'required|exists:taken_tasks,taken_task_id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:255',
            'tracking_status' => 'nullable|in:auto,manual',
            'recorded_at' => 'nullable|date',
        ]);

        $userId = $request->user()->id;

        // Verify user is assigned to this task
        $takenTask = TakenTaskModel::findOrFail($request->taken_task_id);
        if (!$takenTask->hasUser($userId)) {
            return response()->json([
                'message' => 'You are not assigned to this task'
            ], 403);
        }

        // Verify task is active (in_progress)
        if ($takenTask->status !== 'in_progress') {
            return response()->json([
                'message' => 'Location tracking is only available for tasks in progress'
            ], 422);
        }

        $location = LocationModel::create([
            'user_id' => $userId,
            'taken_task_id' => $request->taken_task_id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'accuracy' => $request->accuracy,
            'address' => $request->address,
            'tracking_status' => $request->tracking_status ?? 'manual',
            'recorded_at' => $request->recorded_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Location recorded successfully',
            'location' => $location->load(['user', 'takenTask.task'])
        ], 201);
    }

    /**
     * Store multiple location records at once (batch)
     */
    public function storeBatch(Request $request)
    {
        $request->validate([
            'locations' => 'required|array|min:1|max:100',
            'locations.*.taken_task_id' => 'required|exists:taken_tasks,taken_task_id',
            'locations.*.latitude' => 'required|numeric|between:-90,90',
            'locations.*.longitude' => 'required|numeric|between:-180,180',
            'locations.*.accuracy' => 'nullable|numeric|min:0',
            'locations.*.address' => 'nullable|string|max:255',
            'locations.*.tracking_status' => 'nullable|in:auto,manual',
            'locations.*.recorded_at' => 'nullable|date',
        ]);

        $userId = $request->user()->id;
        $created = [];
        $errors = [];

        foreach ($request->locations as $index => $locationData) {
            try {
                $takenTask = TakenTaskModel::find($locationData['taken_task_id']);

                if (!$takenTask || !$takenTask->hasUser($userId)) {
                    $errors[] = "Location $index: Not assigned to task";
                    continue;
                }

                if ($takenTask->status !== 'in_progress') {
                    $errors[] = "Location $index: Task not in progress";
                    continue;
                }

                $created[] = LocationModel::create([
                    'user_id' => $userId,
                    'taken_task_id' => $locationData['taken_task_id'],
                    'latitude' => $locationData['latitude'],
                    'longitude' => $locationData['longitude'],
                    'accuracy' => $locationData['accuracy'] ?? null,
                    'address' => $locationData['address'] ?? null,
                    'tracking_status' => $locationData['tracking_status'] ?? 'auto',
                    'recorded_at' => $locationData['recorded_at'] ?? now(),
                ]);
            } catch (\Exception $e) {
                $errors[] = "Location $index: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => count($created) . ' location(s) recorded successfully',
            'created_count' => count($created),
            'error_count' => count($errors),
            'errors' => $errors,
        ], count($created) > 0 ? 201 : 422);
    }

    /**
     * Get location history for a specific task assignment
     */
    public function getTaskLocations(Request $request, $takenTaskId)
    {
        $takenTask = TakenTaskModel::findOrFail($takenTaskId);

        // Check permission - user must be assigned to task or be admin/superadmin
        $authUser = $request->user();
        if (!$takenTask->hasUser($authUser->id) && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to view this task locations'
            ], 403);
        }

        $query = LocationModel::where('taken_task_id', $takenTaskId)
            ->with(['user:id,name,email']);

        // Filter by specific user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->withinDateRange($request->start_date, $request->end_date);
        }

        // Filter by tracking status
        if ($request->has('tracking_status')) {
            $query->where('tracking_status', $request->tracking_status);
        }

        $locations = $query->orderBy('recorded_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'task' => $takenTask->load('task'),
            'locations' => $locations
        ]);
    }

    /**
     * Get location history for authenticated user
     */
    public function myLocations(Request $request)
    {
        $userId = $request->user()->id;

        $query = LocationModel::where('user_id', $userId)
            ->with(['takenTask.task']);

        // Filter by task
        if ($request->has('taken_task_id')) {
            $query->where('taken_task_id', $request->taken_task_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->withinDateRange($request->start_date, $request->end_date);
        }

        // Filter by date (single day)
        if ($request->has('date')) {
            $query->whereDate('recorded_at', $request->date);
        }

        $locations = $query->orderBy('recorded_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($locations);
    }

    /**
     * Get latest/current location for users in a task
     */
    public function getCurrentLocations(Request $request, $takenTaskId)
    {
        $takenTask = TakenTaskModel::findOrFail($takenTaskId);

        // Check permission
        $authUser = $request->user();
        if (!$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Only admins can view current locations'
            ], 403);
        }

        // Get latest location for each user assigned to this task
        $userIds = $takenTask->user_ids;
        $currentLocations = [];

        foreach ($userIds as $userId) {
            $location = LocationModel::where('taken_task_id', $takenTaskId)
                ->where('user_id', $userId)
                ->orderBy('recorded_at', 'desc')
                ->with(['user:id,name,email,avatar'])
                ->first();

            if ($location) {
                $currentLocations[] = $location;
            }
        }

        return response()->json([
            'task' => $takenTask->load('task'),
            'current_locations' => $currentLocations,
            'total_users' => count($userIds),
            'tracked_users' => count($currentLocations)
        ]);
    }

    /**
     * Get location tracking statistics for a task
     */
    public function taskStatistics($takenTaskId)
    {
        $takenTask = TakenTaskModel::findOrFail($takenTaskId);

        $stats = [
            'total_locations' => LocationModel::where('taken_task_id', $takenTaskId)->count(),
            'auto_tracked' => LocationModel::where('taken_task_id', $takenTaskId)
                ->where('tracking_status', 'auto')->count(),
            'manual_tracked' => LocationModel::where('taken_task_id', $takenTaskId)
                ->where('tracking_status', 'manual')->count(),
            'tracking_by_user' => LocationModel::where('taken_task_id', $takenTaskId)
                ->select('user_id', DB::raw('count(*) as location_count'))
                ->groupBy('user_id')
                ->with('user:id,name')
                ->get(),
            'first_recorded' => LocationModel::where('taken_task_id', $takenTaskId)
                ->min('recorded_at'),
            'last_recorded' => LocationModel::where('taken_task_id', $takenTaskId)
                ->max('recorded_at'),
        ];

        return response()->json($stats);
    }

    /**
     * Get location tracking statistics for a user
     */
    public function userStatistics(Request $request, $userId = null)
    {
        // If no userId provided, use authenticated user
        $userId = $userId ?? $request->user()->id;

        // Check permission - only admin/superadmin or self can view
        $authUser = $request->user();
        if ($userId !== $authUser->id && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to view this user statistics'
            ], 403);
        }

        $stats = [
            'total_locations' => LocationModel::where('user_id', $userId)->count(),
            'auto_tracked' => LocationModel::where('user_id', $userId)
                ->where('tracking_status', 'auto')->count(),
            'manual_tracked' => LocationModel::where('user_id', $userId)
                ->where('tracking_status', 'manual')->count(),
            'tracking_by_task' => LocationModel::where('user_id', $userId)
                ->select('taken_task_id', DB::raw('count(*) as location_count'))
                ->groupBy('taken_task_id')
                ->with('takenTask.task:task_id,title')
                ->get(),
            'first_recorded' => LocationModel::where('user_id', $userId)
                ->min('recorded_at'),
            'last_recorded' => LocationModel::where('user_id', $userId)
                ->max('recorded_at'),
            'locations_today' => LocationModel::where('user_id', $userId)
                ->whereDate('recorded_at', today())->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get location tracking route/path for visualization
     */
    public function getRoute(Request $request, $takenTaskId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $takenTask = TakenTaskModel::findOrFail($takenTaskId);

        // Check permission
        $authUser = $request->user();
        if (!$authUser->hasAnyRole(['admin', 'superadmin']) && $authUser->id !== $request->user_id) {
            return response()->json([
                'message' => 'Unauthorized to view this route'
            ], 403);
        }

        $query = LocationModel::where('taken_task_id', $takenTaskId)
            ->where('user_id', $request->user_id);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->withinDateRange($request->start_date, $request->end_date);
        }

        $locations = $query->orderBy('recorded_at', 'asc')->get();

        // Calculate total distance traveled
        $totalDistance = 0;
        for ($i = 1; $i < count($locations); $i++) {
            $totalDistance += LocationModel::calculateDistance(
                $locations[$i - 1]->latitude,
                $locations[$i - 1]->longitude,
                $locations[$i]->latitude,
                $locations[$i]->longitude
            );
        }

        return response()->json([
            'task' => $takenTask->load('task'),
            'user' => User::find($request->user_id, ['id', 'name', 'email']),
            'route' => $locations,
            'total_points' => count($locations),
            'total_distance_km' => round($totalDistance, 2),
            'start_time' => $locations->first()?->recorded_at,
            'end_time' => $locations->last()?->recorded_at,
        ]);
    }

    /**
     * Delete location record (admin only)
     */
    public function destroy($locationId)
    {
        $location = LocationModel::findOrFail($locationId);
        $location->delete();

        return response()->json([
            'message' => 'Location record deleted successfully'
        ]);
    }

    /**
     * Get locations near a specific coordinate
     */
    public function getNearby(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.1|max:50', // radius in km
            'taken_task_id' => 'nullable|exists:taken_tasks,taken_task_id',
        ]);

        $radius = $request->get('radius', 1); // Default 1km
        $lat = $request->latitude;
        $lon = $request->longitude;

        // Haversine formula to find locations within radius
        $query = LocationModel::select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [$lat, $lon, $lat]
            )
            ->having('distance', '<=', $radius)
            ->with(['user:id,name,email', 'takenTask.task']);

        if ($request->has('taken_task_id')) {
            $query->where('taken_task_id', $request->taken_task_id);
        }

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->withinDateRange($request->start_date, $request->end_date);
        }

        $locations = $query->orderBy('distance', 'asc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'search_center' => [
                'latitude' => $lat,
                'longitude' => $lon,
                'radius_km' => $radius
            ],
            'locations' => $locations
        ]);
    }
}
