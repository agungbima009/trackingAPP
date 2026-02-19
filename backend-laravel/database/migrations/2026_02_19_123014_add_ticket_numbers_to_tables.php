<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add ticket_number to tasks table
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('ticket_number')->unique()->nullable()->after('task_id');
        });

        // Add ticket_number to taken_tasks table
        Schema::table('taken_tasks', function (Blueprint $table) {
            $table->string('ticket_number')->unique()->nullable()->after('taken_task_id');
        });

        // Add ticket_number to reports table
        Schema::table('reports', function (Blueprint $table) {
            $table->string('ticket_number')->unique()->nullable()->after('report_id');
        });

        // Generate ticket numbers for existing records
        $this->generateExistingTickets();
    }

    /**
     * Generate ticket numbers for existing records
     */
    private function generateExistingTickets(): void
    {
        // Generate ticket numbers for existing tasks
        $tasks = DB::table('tasks')->orderBy('created_at')->get();
        foreach ($tasks as $index => $task) {
            DB::table('tasks')
                ->where('task_id', $task->task_id)
                ->update(['ticket_number' => 'TSK-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT)]);
        }

        // Generate ticket numbers for existing taken_tasks
        $takenTasks = DB::table('taken_tasks')->orderBy('created_at')->get();
        foreach ($takenTasks as $index => $takenTask) {
            DB::table('taken_tasks')
                ->where('taken_task_id', $takenTask->taken_task_id)
                ->update(['ticket_number' => 'TT-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT)]);
        }

        // Generate ticket numbers for existing reports
        $reports = DB::table('reports')->orderBy('created_at')->get();
        foreach ($reports as $index => $report) {
            DB::table('reports')
                ->where('report_id', $report->report_id)
                ->update(['ticket_number' => 'RPT-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('ticket_number');
        });

        Schema::table('taken_tasks', function (Blueprint $table) {
            $table->dropColumn('ticket_number');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('ticket_number');
        });
    }
};
