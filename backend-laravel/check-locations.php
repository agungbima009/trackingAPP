<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking Location Data for Assignment:\n";
echo "=====================================\n\n";

$takenTask = App\Models\TakenTaskModel::with(['task'])->first();

if ($takenTask) {
    echo "Assignment: " . $takenTask->task->title . "\n";
    echo "Status: " . $takenTask->status . "\n";
    echo "User IDs: " . json_encode($takenTask->user_ids) . "\n\n";
    
    $locations = App\Models\LocationModel::where('taken_task_id', $takenTask->taken_task_id)
        ->orderBy('recorded_at', 'desc')
        ->get();
    
    echo "Total location records: " . $locations->count() . "\n\n";
    
    if ($locations->count() > 0) {
        echo "Sample location data:\n";
        echo "-------------------\n";
        
        // Group by user
        $groupedByUser = $locations->groupBy('user_id');
        
        foreach ($groupedByUser as $userId => $userLocations) {
            $user = App\Models\User::find($userId);
            echo "\nUser: " . $user->name . " (" . $userId . ")\n";
            echo "Total locations: " . $userLocations->count() . "\n";
            
            // Show latest location
            $latest = $userLocations->first();
            echo "Latest location:\n";
            echo "  Lat: " . $latest->latitude . "\n";
            echo "  Lng: " . $latest->longitude . "\n";
            echo "  Accuracy: " . $latest->accuracy . " meters\n";
            echo "  Address: " . $latest->address . "\n";
            echo "  Recorded: " . $latest->recorded_at . "\n";
        }
    } else {
        echo "No location data found!\n";
    }
} else {
    echo "No taken tasks found\n";
}
