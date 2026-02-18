<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        $this->command->newLine();

        // Seed in specific order due to dependencies
        $this->call([
            RolePermissionSeeder::class,  // 1. Create roles and permissions first
            UserSeeder::class,             // 2. Create users and assign roles
            TaskSeeder::class,             // 3. Create tasks
            TakenTaskSeeder::class,        // 4. Assign tasks to users
            LocationSeeder::class,         // 5. Add location tracking data
            ReportSeeder::class,           // 6. Add reports for completed tasks
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->newLine();
        $this->command->info('📋 Summary:');
        $this->command->info('  • Roles & Permissions: superadmin, admin, employee');
        $this->command->info('  • Users: 11 total (1 superadmin, 2 admins, 8 employees)');
        $this->command->info('  • Tasks: 15 tasks (various statuses)');
        $this->command->info('  • Task Assignments: Tasks assigned to employees');
        $this->command->info('  • Locations: Tracking data for active tasks');
        $this->command->info('  • Reports: Reports for completed tasks');
        $this->command->newLine();
        $this->command->info('🔑 Default login credentials:');
        $this->command->info('  Superadmin: superadmin@trackingapp.com / password123');
        $this->command->info('  Admin: admin@trackingapp.com / password123');
        $this->command->info('  Employee: michael@trackingapp.com / password123');
        $this->command->newLine();
    }
}
