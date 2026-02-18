<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReportModel;
use App\Models\TakenTaskModel;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all completed taken tasks
        $completedTasks = TakenTaskModel::where('status', 'completed')->get();

        if ($completedTasks->isEmpty()) {
            $this->command->info('No completed tasks found. Skipping report seeding.');
            return;
        }

        $reportTemplates = [
            [
                'title' => 'Task Completed Successfully',
                'content' => 'All objectives for this task have been successfully completed. The client was satisfied with the service provided. No issues encountered during execution. All required documentation has been collected and filed. Follow-up scheduled for next week.',
            ],
            [
                'title' => 'Installation Complete',
                'content' => 'Equipment installation completed as scheduled. All units tested and verified to be functioning properly. Client staff trained on basic operation and maintenance. Installation checklist completed and signed off by site supervisor.',
            ],
            [
                'title' => 'Inspection Report',
                'content' => 'Comprehensive inspection completed. Found 3 minor issues that have been documented with photos. Recommended repairs scheduled for next maintenance window. Overall facility condition is good. Safety compliance verified.',
            ],
            [
                'title' => 'Delivery Confirmation',
                'content' => 'Package delivered successfully to customer site. Signature obtained and recorded in system. Product condition verified upon arrival - no damage observed. Customer expressed satisfaction with timely delivery.',
            ],
            [
                'title' => 'Maintenance Summary',
                'content' => 'Quarterly maintenance check completed on all equipment. Replaced 2 worn belts and 1 filter. Oil levels checked and topped up. All equipment running within normal parameters. Next maintenance due in 3 months.',
            ],
            [
                'title' => 'Training Session Complete',
                'content' => 'Training session delivered to 12 participants. All attendees completed the assessment with passing scores. Training materials distributed. Certificates of completion issued. Positive feedback received from participants.',
            ],
            [
                'title' => 'Data Collection Report',
                'content' => 'Monthly data collection completed across all designated sites. 47 data points recorded. Noticed slight increase in metrics compared to previous month. Detailed analysis attached. No anomalies detected.',
            ],
            [
                'title' => 'Network Setup Complete',
                'content' => 'Network infrastructure setup completed successfully. All routers and switches configured and tested. WiFi coverage verified across all areas. Security protocols implemented. System handed over to IT team.',
            ],
            [
                'title' => 'Quality Audit Results',
                'content' => 'Quality audit of production line completed. Overall score: 92%. Identified 5 areas for improvement with recommended actions. Positive trends noted in quality consistency. Management briefing scheduled.',
            ],
            [
                'title' => 'Emergency Response Report',
                'content' => 'Emergency situation assessed and resolved. Coordinated with local team for immediate response. Damage minimal and contained. Repairs completed on-site. Incident report filed with management. Normal operations resumed.',
            ],
            [
                'title' => 'Inventory Count Complete',
                'content' => 'Monthly inventory count finished. All items verified and system updated. Found 3 discrepancies which have been investigated and resolved. Inventory accuracy: 99.8%. Restocking orders placed for low-stock items.',
            ],
            [
                'title' => 'Customer Support Visit',
                'content' => 'On-site customer support provided. Issue identified and resolved within 2 hours. Customer system now operating normally. Provided additional troubleshooting tips to prevent future issues. Customer very satisfied with service.',
            ],
            [
                'title' => 'Equipment Pickup Complete',
                'content' => 'New equipment picked up from vendor as scheduled. Order verified complete - all items present and accounted for. Equipment in excellent condition. Safely transported to warehouse and logged into inventory system.',
            ],
        ];

        $createdReports = 0;

        foreach ($completedTasks as $takenTask) {
            $userIds = $takenTask->user_ids ?? [];

            if (empty($userIds)) {
                continue;
            }

            // Select a random report template
            $template = $reportTemplates[array_rand($reportTemplates)];

            // Some completed tasks might have reports from multiple team members
            $numberOfReports = (count($userIds) > 1 && rand(1, 10) > 7) ? rand(1, count($userIds)) : 1;
            $reportingUsers = array_slice($userIds, 0, $numberOfReports);

            foreach ($reportingUsers as $userId) {
                // Add some variation to the report content
                $reportContent = $template['title'] . "\n\n" . $template['content'];

                // Add timestamp
                $reportContent .= "\n\nReport submitted by user at: " . now()->format('Y-m-d H:i:s');

                // Randomly decide if this report has an image (30% chance)
                $hasImage = rand(1, 10) <= 3;
                $imagePath = $hasImage ? 'reports/' . uniqid() . '_report_image.jpg' : null;

                ReportModel::create([
                    'user_id' => $userId,
                    'taken_task_id' => $takenTask->taken_task_id,
                    'report' => $reportContent,
                    'image' => $imagePath,
                    'created_at' => $takenTask->end_time ?? now(),
                    'updated_at' => $takenTask->end_time ?? now(),
                ]);

                $createdReports++;
            }
        }

        $this->command->info('Report data seeded successfully!');
        $this->command->info('Created ' . $createdReports . ' reports');
        $this->command->info('  - Reports linked to ' . $completedTasks->count() . ' completed tasks');
        $this->command->info('  - ' . round(($createdReports * 0.3)) . ' reports include image references');
        $this->command->info('  - Realistic report content with timestamps');
    }
}
