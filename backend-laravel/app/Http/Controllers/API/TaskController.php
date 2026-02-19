<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TasksModel;
use App\Models\TakenTaskModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Get all tasks with optional filters
     */
    public function index(Request $request)
    {
        $query = TasksModel::with(['takenTasks']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Add subquery to check for completed taken tasks
        $query->addSelect([
            'has_completed_taken_task' => TakenTaskModel::selectRaw('COUNT(*)')
                ->whereColumn('taken_tasks.task_id', 'tasks.task_id')
                ->where('taken_tasks.status', 'completed')
                ->limit(1)
        ]);

        // Sort by completed taken tasks first (descending so tasks with completed taken tasks appear first)
        $query->orderByDesc('has_completed_taken_task');

        // Then sort by user preference
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $tasks = $query->paginate($request->get('per_page', 15));

        return response()->json($tasks);
    }

    /**
     * Create a new task
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'status' => 'nullable|in:pending,active,completed,inactive',
            'start_time' => 'nullable|date_format:H:i:s,H:i',
            'end_time' => 'nullable|date_format:H:i:s,H:i|after:start_time',
        ]);

        $taskData = [
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'start_time' => $request->start_time ?? '08:00:00',
            'end_time' => $request->end_time ?? '17:00:00',
            'manual_override' => false,
        ];

        // If status is provided, set manual_override to true
        if ($request->has('status')) {
            $taskData['status'] = $request->status;
            $taskData['manual_override'] = true;
        }

        $task = TasksModel::create($taskData);

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load('takenTasks')
        ], 201);
    }

    /**
     * Get specific task details
     */
    public function show($id)
    {
        $task = TasksModel::with(['takenTasks'])->findOrFail($id);

        // Get statistics
        $stats = [
            'total_assignments' => $task->takenTasks->count(),
            'completed' => $task->takenTasks->where('status', 'completed')->count(),
            'in_progress' => $task->takenTasks->where('status', 'in_progress')->count(),
            'pending' => $task->takenTasks->where('status', 'pending')->count(),
        ];

        return response()->json([
            'task' => $task,
            'statistics' => $stats
        ]);
    }

    /**
     * Update task
     */
    public function update(Request $request, $id)
    {
        $task = TasksModel::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'location' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:pending,active,completed,inactive',
            'start_time' => 'nullable|date_format:H:i:s,H:i',
            'end_time' => 'nullable|date_format:H:i:s,H:i|after:start_time',
        ]);

        $updateData = $request->only([
            'title',
            'description',
            'location',
            'start_time',
            'end_time'
        ]);

        // If status is being updated, set manual_override to true
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
            $updateData['manual_override'] = true;
        }

        $task->update($updateData);

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load('takenTasks')
        ]);
    }

    /**
     * Delete task
     */
    public function destroy($id)
    {
        $task = TasksModel::findOrFail($id);

        // Check if task has assignments
        if ($task->takenTasks()->exists()) {
            return response()->json([
                'message' => 'Cannot delete task with existing assignments. Please remove all assignments first.'
            ], 422);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Assign task to users (employees)
     */
    public function assignToUsers(Request $request, $id)
    {
        $task = TasksModel::findOrFail($id);

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'date' => 'nullable|date',
            'start_time' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        // Update task status to 'pending' when assigning
        $task->update([
            'status' => 'pending',
            'manual_override' => true
        ]);

        // Create single assignment for all users
        $assignment = TakenTaskModel::create([
            'task_id' => $task->task_id,
            'user_ids' => $request->user_ids,
            'date' => $request->date ?? now()->toDateString(),
            'start_time' => $request->start_time,
            'status' => 'pending',
        ]);

        $assignment->load('task');

        return response()->json([
            'message' => count($request->user_ids) . ' user(s) assigned to task successfully',
            'assignment' => $assignment,
            'assigned_users' => $assignment->getUsers()
        ], 201);
    }

    /**
     * Get task statistics
     */
    public function statistics()
    {
        $stats = [
            'total_tasks' => TasksModel::count(),
            'active_tasks' => TasksModel::where('status', 'active')->count(),
            'completed_tasks' => TasksModel::where('status', 'completed')->count(),
            'pending_tasks' => TasksModel::where('status', 'pending')->count(),
            'cancelled_tasks' => TasksModel::where('status', 'cancelled')->count(),
            'total_assignments' => TakenTaskModel::count(),
            'assignments_by_status' => TakenTaskModel::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
        ];

        return response()->json($stats);
    }

    /**
     * Get tasks by location
     */
    public function byLocation()
    {
        $tasks = TasksModel::select('location', DB::raw('count(*) as count'))
            ->groupBy('location')
            ->get();

        return response()->json([
            'locations' => $tasks
        ]);
    }

    /**
     * Reset task to automatic status mode (based on time)
     */
    public function resetToAuto($id)
    {
        $task = TasksModel::findOrFail($id);

        $task->update([
            'manual_override' => false
        ]);

        // Refresh to get computed status
        $task->refresh();

        return response()->json([
            'message' => 'Task reset to automatic status mode',
            'task' => $task->load('takenTasks'),
            'current_status' => $task->status,
            'is_within_hours' => $task->isWithinWorkingHours()
        ]);
    }

    /**
     * Mark task as completed (admin action after report is submitted)
     */
    public function markAsCompleted(Request $request, $id)
    {
        $task = TasksModel::findOrFail($id);

        // Task must be in pending status to mark as completed
        if ($task->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending tasks can be marked as completed'
            ], 422);
        }

        // Check if there are any completed taken tasks for this task
        $completedTakenTasks = $task->takenTasks()->where('status', 'completed')->count();
        
        if ($completedTakenTasks === 0) {
            return response()->json([
                'message' => 'No completed assignments found. At least one assignment must be completed before marking task as completed.'
            ], 422);
        }

        $task->update([
            'status' => 'completed',
            'manual_override' => true
        ]);

        return response()->json([
            'message' => 'Task marked as completed successfully',
            'task' => $task->load('takenTasks')
        ]);
    }
}
