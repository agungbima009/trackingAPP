<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TasksModel;
use Illuminate\Support\Str;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = [
            [
                'title' => 'Client Meeting - Downtown Office',
                'description' => 'Meet with potential client to discuss new project requirements and deliverables. Bring presentation materials and contract documents.',
                'location' => '123 Business Plaza, Downtown, City Center',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Equipment Installation - North Branch',
                'description' => 'Install and configure new tracking equipment at the North Branch office. Test all functionality before leaving the site.',
                'location' => '456 North Avenue, North District',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Site Inspection - Warehouse A',
                'description' => 'Conduct monthly safety inspection of Warehouse A. Complete checklist and document any issues found.',
                'location' => '789 Industrial Park, Warehouse District',
                'status' => 'in_progress',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Delivery - Customer Site Alpha',
                'description' => 'Deliver package to customer site and obtain signature. Ensure product is in good condition upon arrival.',
                'location' => '321 Customer Street, Alpha Zone',
                'status' => 'in_progress',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Maintenance Check - East Facility',
                'description' => 'Perform quarterly maintenance check on all equipment at East Facility. Replace any worn parts.',
                'location' => '654 East Boulevard, East Side',
                'status' => 'completed',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Training Session - Regional Office',
                'description' => 'Conduct training session for new employees on company procedures and safety protocols.',
                'location' => '987 Regional Center, Midtown',
                'status' => 'completed',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Data Collection - Multiple Sites',
                'description' => 'Visit designated sites to collect monthly data readings and submit report by end of day.',
                'location' => 'Various locations in South District',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Network Setup - West Branch',
                'description' => 'Set up new network infrastructure at West Branch. Configure routers, switches, and access points.',
                'location' => '147 West Street, West Quarter',
                'status' => 'in_progress',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Quality Audit - Production Line B',
                'description' => 'Conduct quality audit of Production Line B. Document findings and recommend improvements.',
                'location' => '258 Factory Road, Manufacturing Zone',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Emergency Response - Site Beta',
                'description' => 'Respond to emergency situation at Site Beta. Assess damage and coordinate repair efforts.',
                'location' => '369 Emergency Lane, Beta Sector',
                'status' => 'completed',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Inventory Count - Storage Facility',
                'description' => 'Perform monthly inventory count at central storage facility. Update system with accurate counts.',
                'location' => '741 Storage Way, Central District',
                'status' => 'in_progress',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Customer Support - Field Visit',
                'description' => 'Visit customer site to troubleshoot reported issues and provide on-site support.',
                'location' => '852 Support Street, Service Area',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Documentation Review - Head Office',
                'description' => 'Review and update project documentation at head office. Ensure all records are current.',
                'location' => '963 Corporate Drive, Business Park',
                'status' => 'pending',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Equipment Pickup - Vendor Location',
                'description' => 'Pick up new equipment from vendor and transport to warehouse. Verify order completeness.',
                'location' => '159 Vendor Plaza, Supplier District',
                'status' => 'completed',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
            [
                'title' => 'Safety Training - Construction Site',
                'description' => 'Deliver mandatory safety training to construction site workers. Ensure all participants sign attendance.',
                'location' => '357 Construction Avenue, Build Zone',
                'status' => 'in_progress',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'manual_override' => true,
            ],
        ];

        foreach ($tasks as $taskData) {
            TasksModel::create($taskData);
        }

        $this->command->info('Tasks seeded successfully!');
        $this->command->info('Created 15 tasks with various statuses:');
        $this->command->info('  - Pending: 6 tasks');
        $this->command->info('  - In Progress: 5 tasks');
        $this->command->info('  - Completed: 4 tasks');
    }
}
