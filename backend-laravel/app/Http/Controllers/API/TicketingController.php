<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TasksModel;
use App\Models\TakenTaskModel;
use App\Models\ReportModel;
use Illuminate\Http\Request;

class TicketingController extends Controller
{
    /**
     * Get all tickets across all entities
     * Supports filtering by type and searching
     */
    public function index(Request $request)
    {
        $type = $request->get('type'); // 'task', 'taken_task', 'report', or null for all
        $search = $request->get('search');
        $perPage = $request->get('per_page', 15);

        $tickets = [];

        // Get task tickets
        if (!$type || $type === 'task') {
            $taskQuery = TasksModel::select('task_id', 'ticket_number', 'title', 'created_at')
                ->whereNotNull('ticket_number');

            if ($search) {
                $taskQuery->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            }

            $tasks = $taskQuery->orderBy('created_at', 'desc')->get();
            foreach ($tasks as $task) {
                $tickets[] = [
                    'type' => 'task',
                    'id' => $task->task_id,
                    'ticket_number' => $task->ticket_number,
                    'title' => $task->title,
                    'created_at' => $task->created_at,
                    'url' => "/api/admin/tasks/{$task->task_id}",
                ];
            }
        }

        // Get taken task tickets
        if (!$type || $type === 'taken_task') {
            $takenTaskQuery = TakenTaskModel::with('task:task_id,title')
                ->select('taken_task_id', 'ticket_number', 'task_id', 'created_at')
                ->whereNotNull('ticket_number');

            if ($search) {
                $takenTaskQuery->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%");
                })->orWhereHas('task', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            }

            $takenTasks = $takenTaskQuery->orderBy('created_at', 'desc')->get();
            foreach ($takenTasks as $takenTask) {
                $tickets[] = [
                    'type' => 'taken_task',
                    'id' => $takenTask->taken_task_id,
                    'ticket_number' => $takenTask->ticket_number,
                    'title' => $takenTask->task?->title ?? 'N/A',
                    'created_at' => $takenTask->created_at,
                    'url' => "/api/admin/assignments/{$takenTask->taken_task_id}",
                ];
            }
        }

        // Get report tickets
        if (!$type || $type === 'report') {
            $reportQuery = ReportModel::with('takenTask.task:task_id,title')
                ->select('report_id', 'ticket_number', 'taken_task_id', 'created_at')
                ->whereNotNull('ticket_number');

            if ($search) {
                $reportQuery->where('ticket_number', 'like', "%{$search}%")
                    ->orWhereHas('takenTask.task', function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%");
                    });
            }

            $reports = $reportQuery->orderBy('created_at', 'desc')->get();
            foreach ($reports as $report) {
                $tickets[] = [
                    'type' => 'report',
                    'id' => $report->report_id,
                    'ticket_number' => $report->ticket_number,
                    'title' => $report->takenTask?->task?->title ?? 'N/A',
                    'created_at' => $report->created_at,
                    'url' => "/api/reports/{$report->report_id}",
                ];
            }
        }

        // Sort by created_at descending
        usort($tickets, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Manual pagination
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;
        $total = count($tickets);
        $tickets = array_slice($tickets, $offset, $perPage);

        return response()->json([
            'data' => $tickets,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    /**
     * Get ticket details by ticket number
     */
    public function getByTicketNumber(Request $request, $ticketNumber)
    {
        // Check in tasks
        $task = TasksModel::where('ticket_number', $ticketNumber)->first();
        if ($task) {
            return response()->json([
                'type' => 'task',
                'entity' => $task,
            ]);
        }

        // Check in taken tasks
        $takenTask = TakenTaskModel::with('task:task_id,title')->where('ticket_number', $ticketNumber)->first();
        if ($takenTask) {
            return response()->json([
                'type' => 'taken_task',
                'entity' => $takenTask,
            ]);
        }

        // Check in reports
        $report = ReportModel::with('takenTask.task', 'user:id,name,email')->where('ticket_number', $ticketNumber)->first();
        if ($report) {
            return response()->json([
                'type' => 'report',
                'entity' => $report,
            ]);
        }

        return response()->json([
            'message' => 'Ticket not found',
        ], 404);
    }

    /**
     * Search tickets - full text search across all ticket types
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        if (strlen($query) < 2) {
            return response()->json([
                'message' => 'Search query must be at least 2 characters',
            ], 422);
        }

        $tickets = [];

        // Search in tasks
        $tasks = TasksModel::where('ticket_number', 'like', "%{$query}%")
            ->orWhere('title', 'like', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($tasks as $task) {
            $tickets[] = [
                'type' => 'task',
                'ticket_number' => $task->ticket_number,
                'title' => $task->title,
                'created_at' => $task->created_at,
            ];
        }

        // Search in taken tasks
        $takenTasks = TakenTaskModel::where('ticket_number', 'like', "%{$query}%")
            ->with('task:task_id,title')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($takenTasks as $takenTask) {
            $tickets[] = [
                'type' => 'taken_task',
                'ticket_number' => $takenTask->ticket_number,
                'title' => $takenTask->task?->title ?? 'N/A',
                'created_at' => $takenTask->created_at,
            ];
        }

        // Search in reports
        $reports = ReportModel::where('ticket_number', 'like', "%{$query}%")
            ->with('takenTask.task:task_id,title')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($reports as $report) {
            $tickets[] = [
                'type' => 'report',
                'ticket_number' => $report->ticket_number,
                'title' => $report->takenTask?->task?->title ?? 'N/A',
                'created_at' => $report->created_at,
            ];
        }

        // Sort by created_at descending
        usort($tickets, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'results' => array_splice($tickets, 0, 20),
            'total' => count($tickets),
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $userId = $request->user()?->id;

        return response()->json([
            'statistics' => [
                'total_tasks' => TasksModel::count(),
                'total_taken_tasks' => TakenTaskModel::count(),
                'total_reports' => ReportModel::count(),
                'tasks_with_tickets' => TasksModel::whereNotNull('ticket_number')->count(),
                'taken_tasks_with_tickets' => TakenTaskModel::whereNotNull('ticket_number')->count(),
                'reports_with_tickets' => ReportModel::whereNotNull('ticket_number')->count(),
                'user_reports' => $userId ? ReportModel::where('user_id', $userId)->count() : 0,
            ],
        ]);
    }
}
