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

        // Sort by
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
            'status' => 'required|in:pending,active,completed,cancelled',
        ]);

        $task = TasksModel::create([
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'status' => $request->status,
        ]);

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
            'status' => 'sometimes|required|in:pending,active,completed,cancelled',
        ]);

        $task->update($request->only([
            'title',
            'description',
            'location',
            'status'
        ]));

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
}
