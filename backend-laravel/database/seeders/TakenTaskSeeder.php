<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TakenTaskModel;
use App\Models\TasksModel;
use App\Models\User;
use Carbon\Carbon;

class TakenTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tasks and employees
        $tasks = TasksModel::all();
        $employees = User::role('employee')->get();

        if ($employees->isEmpty()) {
            $this->command->error('No employees found. Please run UserSeeder first.');
            return;
        }

        if ($tasks->isEmpty()) {
            $this->command->error('No tasks found. Please run TaskSeeder first.');
            return;
        }

        $takenTasks = [];

        // Create distribution of statuses: 40% completed, 33% in_progress, 27% pending
        $statusDistribution = ['completed', 'completed', 'completed', 'completed', // 4 completed
                               'in_progress', 'in_progress', 'in_progress', 'in_progress', 'in_progress', // 5 in_progress
                               'pending', 'pending', 'pending', 'pending', 'pending', 'pending']; // 6 pending

        // Assign tasks to employees
        foreach ($tasks as $index => $task) {
            $employeeIndex = $index % $employees->count();
            $employee = $employees[$employeeIndex];

            // Get status from distribution (cycle through if more tasks than distribution items)
            $assignedStatus = $statusDistribution[$index % count($statusDistribution)];

            // Determine dates and times based on assigned status
            if ($assignedStatus === 'completed') {
                // Completed tasks: 3-7 days ago, with end time
                $daysAgo = rand(3, 7);
                $startTime = Carbon::now()->subDays($daysAgo)->setHour(8)->setMinute(rand(0, 59));
                $endTime = $startTime->copy()->addHours(rand(4, 8))->addMinutes(rand(0, 59));
                $status = 'completed';
                $date = $startTime->toDateString();
            } elseif ($assignedStatus === 'in_progress') {
                // In progress tasks: started today or yesterday
                $daysAgo = rand(0, 1);
                $startTime = Carbon::now()->subDays($daysAgo)->setHour(rand(8, 12))->setMinute(rand(0, 59));
                $endTime = null;
                $status = 'in_progress';
                $date = $startTime->toDateString();
            } else {
                // Pending tasks: scheduled for today or future
                $daysAhead = rand(0, 3);
                $startTime = Carbon::now()->addDays($daysAhead)->setHour(rand(9, 10))->setMinute(0);
                $endTime = null;
                $status = 'pending';
                $date = $startTime->toDateString();
            }

            // For some tasks, assign multiple users (team tasks)
            $userIds = [$employee->id];
            if ($index % 3 === 0 && $employees->count() > 1) {
                // Every 3rd task is a team task with 2-3 users
                $teamSize = rand(2, min(3, $employees->count()));
                $teamEmployees = $employees->random($teamSize);
                $userIds = $teamEmployees->pluck('id')->toArray();
            }

            $takenTasks[] = [
                'task_id' => $task->task_id,
                'user_ids' => $userIds,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'date' => $date,
                'status' => $status,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all taken tasks
        foreach ($takenTasks as $takenTaskData) {
            TakenTaskModel::create($takenTaskData);
        }

        $this->command->info('Task assignments seeded successfully!');
        $this->command->info('Created ' . count($takenTasks) . ' task assignments');

        $completedCount = collect($takenTasks)->where('status', 'completed')->count();
        $inProgressCount = collect($takenTasks)->where('status', 'in_progress')->count();
        $pendingCount = collect($takenTasks)->where('status', 'pending')->count();

        $this->command->info('  - Completed: ' . $completedCount);
        $this->command->info('  - In Progress: ' . $inProgressCount);
        $this->command->info('  - Pending: ' . $pendingCount);
        $this->command->info('  - Some tasks assigned to multiple users (team tasks)');
    }
}
