<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LocationModel;
use App\Models\TakenTaskModel;
use Carbon\Carbon;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all taken tasks that are in progress or completed
        $takenTasks = TakenTaskModel::whereIn('status', ['in_progress', 'completed'])->get();

        if ($takenTasks->isEmpty()) {
            $this->command->warn('⚠️  No active taken tasks found for location tracking.');
            $this->command->info('   Skipping location seeding. This is normal if:');
            $this->command->info('   - TakenTaskSeeder created only pending tasks');
            $this->command->info('   - Or no taken tasks were created yet');
            return;
        }

        $totalLocations = 0;

        // Sample locations across various cities (latitude, longitude, address)
        $sampleLocations = [
            [40.7128, -74.0060, '123 Business Plaza, Downtown, City Center'],
            [34.0522, -118.2437, '456 North Avenue, North District'],
            [41.8781, -87.6298, '789 Industrial Park, Warehouse District'],
            [29.7604, -95.3698, '321 Customer Street, Alpha Zone'],
            [33.4484, -112.0740, '654 East Boulevard, East Side'],
            [39.7392, -104.9903, '987 Regional Center, Midtown'],
            [32.7157, -117.1611, 'Various locations in South District'],
            [37.7749, -122.4194, '147 West Street, West Quarter'],
            [47.6062, -122.3321, '258 Factory Road, Manufacturing Zone'],
            [25.7617, -80.1918, '369 Emergency Lane, Beta Sector'],
        ];

        foreach ($takenTasks as $takenTask) {
            $userIds = $takenTask->user_ids ?? [];

            if (empty($userIds)) {
                continue;
            }

            // Determine how many location points to create based on status
            if ($takenTask->status === 'completed') {
                $locationCount = rand(5, 15); // Completed tasks have full tracking history
            } else {
                $locationCount = rand(3, 8); // In-progress tasks have fewer points
            }

            // Get start and end times
            $startTime = Carbon::parse($takenTask->start_time);
            $endTime = $takenTask->end_time ? Carbon::parse($takenTask->end_time) : Carbon::now();

            // Calculate the time interval between location points
            $totalMinutes = $startTime->diffInMinutes($endTime);
            $intervalMinutes = $totalMinutes > 0 ? intval($totalMinutes / $locationCount) : 15;

            // Select a base location for this task
            $baseLocation = $sampleLocations[array_rand($sampleLocations)];

            // Create location points for each user assigned to this task
            foreach ($userIds as $userId) {
                for ($i = 0; $i < $locationCount; $i++) {
                    $recordedAt = $startTime->copy()->addMinutes($intervalMinutes * $i);

                    // Add slight variations to coordinates to simulate movement
                    $latVariation = (rand(-100, 100) / 10000); // ±0.01 degrees
                    $lngVariation = (rand(-100, 100) / 10000);

                    $latitude = $baseLocation[0] + $latVariation;
                    $longitude = $baseLocation[1] + $lngVariation;

                    // Alternate between auto and manual tracking
                    $trackingStatus = ($i % 5 === 0) ? 'manual' : 'auto';

                    // Add some realistic accuracy variation
                    $accuracy = rand(5, 50) + (rand(0, 100) / 100);

                    LocationModel::create([
                        'taken_task_id' => $takenTask->taken_task_id,
                        'user_id' => $userId,
                        'latitude' => round($latitude, 8),
                        'longitude' => round($longitude, 8),
                        'accuracy' => round($accuracy, 2),
                        'address' => $baseLocation[2],
                        'tracking_status' => $trackingStatus,
                        'recorded_at' => $recordedAt,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $totalLocations++;
                }
            }
        }

        $this->command->info('Location tracking data seeded successfully!');
        $this->command->info('Created ' . $totalLocations . ' location records');
        $this->command->info('  - Locations distributed across ' . count($takenTasks) . ' active tasks');
        $this->command->info('  - Mix of auto and manual tracking status');
        $this->command->info('  - Realistic coordinate variations simulating movement');
    }
}
