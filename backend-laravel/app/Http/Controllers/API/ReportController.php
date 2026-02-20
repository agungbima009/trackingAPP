<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ReportModel;
use App\Models\TakenTaskModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Get all reports (Admin only)
     */
    public function index(Request $request)
    {
        $query = ReportModel::with(['user:id,name,email', 'takenTask.task:task_id,title']);

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by taken_task_id (assignment)
        if ($request->has('taken_task_id')) {
            $query->where('taken_task_id', $request->taken_task_id);
        }

        // Filter by task
        if ($request->has('task_id')) {
            $query->whereHas('takenTask', function ($q) use ($request) {
                $q->where('task_id', $request->task_id);
            });
        }

        // Search in report description
        if ($request->has('search')) {
            $query->where('report', 'like', '%' . $request->search . '%');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($reports);
    }

    /**
     * Get my reports (Employee)
     */
    public function myReports(Request $request)
    {
        $userId = $request->user()->id;

        $query = ReportModel::with(['takenTask.task:task_id,title,location'])
            ->where('user_id', $userId);

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 15);
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'reports' => $reports
        ]);
    }

    /**
     * Get report details
     */
    public function show($id)
    {
        $report = ReportModel::with([
            'user:id,name,email,department,position',
            'takenTask.task:task_id,title,description,location'
        ])->find($id);

        if (!$report) {
            return response()->json([
                'message' => 'Report not found'
            ], 404);
        }

        // Add assigned users to the taken task
        if ($report->takenTask) {
            $report->takenTask->users = $report->takenTask->getUsers();
        }

        return response()->json([
            'report' => $report
        ]);
    }

    /**
     * Create a new report
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'taken_task_id' => 'required|uuid|exists:taken_tasks,taken_task_id',
            'report' => 'required|string',
            'photos' => 'nullable|array',
            'photos.*' => 'string', // Base64 encoded images
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify user has access to this task
        $takenTask = TakenTaskModel::find($request->taken_task_id);
        if (!in_array($request->user()->id, $takenTask->user_ids)) {
            return response()->json([
                'message' => 'Unauthorized. You are not assigned to this task.'
            ], 403);
        }

        // Handle photo uploads
        $photoPaths = [];
        if ($request->has('photos') && is_array($request->photos)) {
            foreach ($request->photos as $index => $photoBase64) {
                try {
                    // Extract base64 data
                    if (preg_match('/^data:image\/(\w+);base64,/', $photoBase64, $type)) {
                        $photoBase64 = substr($photoBase64, strpos($photoBase64, ',') + 1);
                        $type = strtolower($type[1]); // jpg, png, gif

                        $photoBase64 = str_replace(' ', '+', $photoBase64);
                        $photoData = base64_decode($photoBase64);

                        if ($photoData === false) {
                            throw new \Exception('Base64 decode failed');
                        }

                        // Generate unique filename
                        $filename = 'report_' . uniqid() . '_' . $index . '.' . $type;
                        $path = 'reports/' . $filename;

                        // Store in public disk
                        Storage::disk('public')->put($path, $photoData);

                        $photoPaths[] = $path;
                    }
                } catch (\Exception $e) {
                    Log::error('Error uploading photo: ' . $e->getMessage());
                    // Continue with other photos
                }
            }
        }

        // Create report
        $report = ReportModel::create([
            'user_id' => $request->user()->id,
            'taken_task_id' => $request->taken_task_id,
            'report' => $request->report,
            'image' => json_encode($photoPaths), // Store as JSON array
        ]);

        return response()->json([
            'message' => 'Report created successfully',
            'report' => $report->load('takenTask.task')
        ], 201);
    }

    /**
     * Update a report
     */
    public function update(Request $request, $id)
    {
        $report = ReportModel::find($id);

        if (!$report) {
            return response()->json([
                'message' => 'Report not found'
            ], 404);
        }

        // Verify ownership (user can only update their own reports)
        if ($report->user_id !== $request->user()->id && !$request->user()->hasRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'report' => 'sometimes|required|string',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update report text
        if ($request->has('report')) {
            $report->report = $request->report;
        }

        // Handle new photos if provided
        if ($request->has('photos') && is_array($request->photos)) {
            // Delete old photos
            $oldPhotos = json_decode($report->image, true) ?? [];
            foreach ($oldPhotos as $oldPhoto) {
                Storage::disk('public')->delete($oldPhoto);
            }

            // Upload new photos
            $photoPaths = [];
            foreach ($request->photos as $index => $photoBase64) {
                try {
                    if (preg_match('/^data:image\/(\w+);base64,/', $photoBase64, $type)) {
                        $photoBase64 = substr($photoBase64, strpos($photoBase64, ',') + 1);
                        $type = strtolower($type[1]);

                        $photoBase64 = str_replace(' ', '+', $photoBase64);
                        $photoData = base64_decode($photoBase64);

                        if ($photoData !== false) {
                            $filename = 'report_' . uniqid() . '_' . $index . '.' . $type;
                            $path = 'reports/' . $filename;
                            Storage::disk('public')->put($path, $photoData);
                            $photoPaths[] = $path;
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error uploading photo: ' . $e->getMessage());
                }
            }

            $report->image = json_encode($photoPaths);
        }

        $report->save();

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report->load('takenTask.task')
        ]);
    }

    /**
     * Delete a report
     */
    public function destroy($id)
    {
        $report = ReportModel::find($id);

        if (!$report) {
            return response()->json([
                'message' => 'Report not found'
            ], 404);
        }

        // Delete associated photos
        $photos = json_decode($report->image, true) ?? [];
        foreach ($photos as $photo) {
            Storage::disk('public')->delete($photo);
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }

    /**
     * Get reports for a specific task (Admin)
     */
    public function taskReports($taskId)
    {
        $reports = ReportModel::with(['user:id,name,email', 'takenTask'])
            ->whereHas('takenTask', function ($q) use ($taskId) {
                $q->where('task_id', $taskId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'reports' => $reports
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $userId = $request->has('user_id') ? $request->user_id : null;

        $query = ReportModel::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $totalReports = $query->count();
        $reportsThisMonth = (clone $query)->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $reportsThisWeek = (clone $query)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        return response()->json([
            'statistics' => [
                'total_reports' => $totalReports,
                'reports_this_month' => $reportsThisMonth,
                'reports_this_week' => $reportsThisWeek,
            ]
        ]);
    }
}
