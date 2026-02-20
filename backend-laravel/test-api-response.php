<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing API Response for Assignment Details:\n";
echo "=============================================\n\n";

$takenTask = App\Models\TakenTaskModel::with(['task'])->first();

if ($takenTask) {
    echo "Assignment ID: " . $takenTask->taken_task_id . "\n";
    echo "Task: " . $takenTask->task->title . "\n\n";
    
    // Simulate what controller does
    $takenTask->users = $takenTask->getUsers();
    
    echo "API Response (simulated):\n";
    echo json_encode([
        'assignment' => [
            'taken_task_id' => $takenTask->taken_task_id,
            'task' => $takenTask->task,
            'users' => $takenTask->users,
            'date' => $takenTask->date,
            'status' => $takenTask->status
        ]
    ], JSON_PRETTY_PRINT) . "\n";
} else {
    echo "No taken tasks found\n";
}
