<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TakenTaskModel;
use App\Models\TasksModel;
use App\Models\User;
use Illuminate\Http\Request;

class TakenTaskController extends Controller
{
    /**
     * Get all task assignments
     */
    public function index(Request $request)
    {
        $query = TakenTaskModel::with(['task']);

        // Filter by user (check if user_id is in the user_ids array)
        if ($request->has('user_id')) {
            $query->whereJsonContains('user_ids', $request->user_id);
        }

        // Filter by task
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $assignments = $query->paginate($request->get('per_page', 15));

        // Add users data to each assignment
        foreach ($assignments->items() as $assignment) {
            $assignment->assigned_users = $assignment->getUsers();
        }

        return response()->json($assignments);
    }

    /**
     * Get specific assignment details
     */
    public function show($id)
    {
        $assignment = TakenTaskModel::with(['task'])->findOrFail($id);

        // Get assigned users
        $assignment->assigned_users = $assignment->getUsers();

        // Calculate duration if both start and end time exist
        $duration = null;
        if ($assignment->start_time && $assignment->end_time) {
            $duration = $assignment->start_time->diffInMinutes($assignment->end_time);
        }

        return response()->json([
            'assignment' => $assignment,
            'duration_minutes' => $duration
        ]);
    }

    /**
     * Create task assignment
     */
    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,task_id',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'date' => 'nullable|date',
            'start_time' => 'nullable|date_format:Y-m-d\TH:i,Y-m-d H:i:s',
            'status' => 'nullable|in:pending,in progress,completed',
        ]);

        $assignment = TakenTaskModel::create([
            'task_id' => $request->task_id,
            'user_ids' => $request->user_ids,
            'date' => $request->date ?? now()->toDateString(),
            'start_time' => $request->start_time,
            'status' => $request->status ?? 'pending',
        ]);

        $assignment->assigned_users = $assignment->getUsers();

        return response()->json([
            'message' => 'Task assigned successfully to ' . count($request->user_ids) . ' user(s)',
            'assignment' => $assignment->load('task')
        ], 201);
    }

    /**
     * Update assignment status and times
     */
    public function update(Request $request, $id)
    {
        $assignment = TakenTaskModel::findOrFail($id);

        $request->validate([
            'status' => 'sometimes|required|in:pending,in progress,completed',
            'start_time' => 'nullable|date_format:Y-m-d\TH:i,Y-m-d H:i:s',
            'end_time' => 'nullable|date_format:Y-m-d\TH:i,Y-m-d H:i:s|after:start_time',
            'date' => 'nullable|date',
        ]);

        $assignment->update($request->only([
            'status',
            'start_time',
            'end_time',
            'date'
        ]));

        $assignment->load('task');

        return response()->json([
            'message' => 'Assignment updated successfully',
            'assignment' => $assignment,
            'assigned_users' => $assignment->getUsers()
        ]);
    }

    /**
     * Start task (employee action)
     */
    public function startTask(Request $request, $id)
    {
        $assignment = TakenTaskModel::findOrFail($id);

        // Check if user is assigned to this task
        $authUser = $request->user();
        if (!$assignment->hasUser($authUser->id) && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to start this task'
            ], 403);
        }

        if ($assignment->status !== 'pending') {
            return response()->json([
                'message' => 'Task can only be started from pending status'
            ], 422);
        }

        $assignment->update([
            'status' => 'in progress',
            'start_time' => now(),
        ]);

        $assignment->load('task');

        return response()->json([
            'message' => 'Task started successfully',
            'assignment' => $assignment,
            'assigned_users' => $assignment->getUsers()
        ]);
    }

    /**
     * Complete task (employee action)
     */
    public function completeTask(Request $request, $id)
    {
        $assignment = TakenTaskModel::findOrFail($id);

        // Check if user is assigned to this task
        $authUser = $request->user();
        if (!$assignment->hasUser($authUser->id) && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to complete this task'
            ], 403);
        }

        if ($assignment->status !== 'in progress') {
            return response()->json([
                'message' => 'Task must be in progress to complete'
            ], 422);
        }

        $assignment->update([
            'status' => 'completed',
            'end_time' => now(),
        ]);

        $assignment->load('task');

        return response()->json([
            'message' => 'Task completed successfully',
            'assignment' => $assignment,
            'assigned_users' => $assignment->getUsers()
        ]);
    }

    /**
     * Cancel task assignment (set back to pending)
     */
    public function cancelTask($id)
    {
        $assignment = TakenTaskModel::findOrFail($id);

        $assignment->update([
            'status' => 'pending',
        ]);

        $assignment->load('task');

        return response()->json([
            'message' => 'Task assignment reset to pending',
            'assignment' => $assignment,
            'assigned_users' => $assignment->getUsers()
        ]);
    }

    /**
     * Delete assignment
     */
    public function destroy($id)
    {
        $assignment = TakenTaskModel::findOrFail($id);

        // Only allow deletion if not completed
        if ($assignment->status === 'completed') {
            return response()->json([
                'message' => 'Cannot delete completed task assignment'
            ], 422);
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Task assignment deleted successfully'
        ]);
    }

    /**
     * Get user's assigned tasks
     */
    public function myTasks(Request $request)
    {
        $userId = $request->user()->id;

        $query = TakenTaskModel::with(['task'])
            ->whereJsonContains('user_ids', $userId);

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        // Order by status priority (in progress -> pending -> completed), then by date
        $query->orderByRaw("
            CASE status
                WHEN 'in progress' THEN 1
                WHEN 'pending' THEN 2
                WHEN 'completed' THEN 3
                ELSE 4
            END
        ")->orderBy('date', 'desc');

        $assignments = $query->paginate($request->get('per_page', 15));

        // Add assigned users, duration, and computed status to each assignment
        $assignments->getCollection()->transform(function ($assignment) {
            $assignment->assigned_users = $assignment->getUsers();

            // Calculate duration if both start and end time exist
            if ($assignment->start_time && $assignment->end_time) {
                $assignment->duration_minutes = $assignment->start_time->diffInMinutes($assignment->end_time);
            }

            // Add computed status and work hours check
            $assignment->is_within_work_hours = $assignment->isWithinWorkHours();
            $assignment->computed_status = $assignment->getComputedStatus();

            return $assignment;
        });

        // Apply status filter AFTER computing statuses
        if ($request->has('status')) {
            $filtered = $assignments->getCollection()->filter(function ($assignment) use ($request) {
                return $assignment->computed_status === $request->status;
            });
            $assignments->setCollection($filtered->values());
        }

        return response()->json($assignments);
    }

    /**
     * Get my task statistics (authenticated user)
     */
    public function myStatistics(Request $request)
    {
        $userId = $request->user()->id;

        // Get all tasks and compute their statuses
        $allTasks = TakenTaskModel::with('task')
            ->whereJsonContains('user_ids', $userId)
            ->get();

        // Count by computed status
        $total = $allTasks->count();
        $completed = 0;
        $inProgress = 0;
        $pending = 0;
        $inactive = 0;

        foreach ($allTasks as $task) {
            $computedStatus = $task->getComputedStatus();
            switch ($computedStatus) {
                case 'completed':
                    $completed++;
                    break;
                case 'in progress':
                    $inProgress++;
                    break;
                case 'pending':
                    $pending++;
                    break;
                case 'inactive':
                    $inactive++;
                    break;
            }
        }

        $stats = [
            'total_tasks' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'pending' => $pending,
            'inactive' => $inactive,
        ];

        // Calculate completion rate
        $stats['completion_rate'] = $total > 0
            ? round(($completed / $total) * 100, 2)
            : 0;

        return response()->json($stats);
    }

    /**
     * Get assignment statistics for a user
     */
    public function userStatistics($userId)
    {
        $stats = [
            'total_assignments' => TakenTaskModel::whereJsonContains('user_ids', $userId)->count(),
            'completed' => TakenTaskModel::whereJsonContains('user_ids', $userId)->where('status', 'completed')->count(),
            'in_progress' => TakenTaskModel::whereJsonContains('user_ids', $userId)->where('status', 'in progress')->count(),
            'pending' => TakenTaskModel::whereJsonContains('user_ids', $userId)->where('status', 'pending')->count(),
        ];

        // Calculate completion rate
        $stats['completion_rate'] = $stats['total_assignments'] > 0
            ? round(($stats['completed'] / $stats['total_assignments']) * 100, 2)
            : 0;

        return response()->json($stats);
    }
}
