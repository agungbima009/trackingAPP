<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking TakenTask users:\n";
echo "----------------------------\n\n";

$takenTask = App\Models\TakenTaskModel::first();

if ($takenTask) {
    echo "Assignment ID: " . $takenTask->taken_task_id . "\n";
    echo "Task: " . $takenTask->task->title . "\n";
    echo "user_ids (raw): " . json_encode($takenTask->user_ids) . "\n";
    echo "Number of user IDs: " . count($takenTask->user_ids) . "\n\n";
    
    echo "getUsers() method result:\n";
    $users = $takenTask->getUsers();
    echo "Count: " . $users->count() . "\n";
    
    foreach ($users as $user) {
        echo "  - " . $user->name . " (" . $user->email . ")\n";
    }
} else {
    echo "No taken tasks found\n";
}
