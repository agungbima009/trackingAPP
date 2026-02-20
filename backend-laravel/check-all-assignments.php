<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking all TakenTasks user counts:\n";
echo "====================================\n\n";

$takenTasks = App\Models\TakenTaskModel::with('task')->get();

foreach ($takenTasks as $tt) {
    $userCount = count($tt->user_ids);
    $users = $tt->getUsers();
    
    echo "ID: " . substr($tt->taken_task_id, 0, 8) . "...\n";
    echo "Task: " . $tt->task->title . "\n";
    echo "User IDs in database: " . $userCount . "\n";
    echo "getUsers() returns: " . $users->count() . " users\n";
    
    if ($users->count() > 0) {
        foreach ($users as $user) {
            echo "  - " . $user->name . "\n";
        }
    }
    
    echo "\n";
}
