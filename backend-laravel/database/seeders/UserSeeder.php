<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Superadmin
        $superadmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@trackingapp.com',
            'password' => Hash::make('password123'),
            'phone_number' => '+1234567890',
            'department' => 'Management',
            'position' => 'System Administrator',
            'address' => '123 Admin Street, Tech City, TC 12345',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $superadmin->assignRole('superadmin');

        // Create Admin Users
        $admin1 = User::create([
            'name' => 'John Doe',
            'email' => 'admin@trackingapp.com',
            'password' => Hash::make('password123'),
            'phone_number' => '+1234567891',
            'department' => 'Operations',
            'position' => 'Operations Manager',
            'address' => '456 Manager Lane, Business District, BD 23456',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $admin1->assignRole('admin');

        $admin2 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'sarah.admin@trackingapp.com',
            'password' => Hash::make('password123'),
            'phone_number' => '+1234567892',
            'department' => 'Human Resources',
            'position' => 'HR Manager',
            'address' => '789 Executive Ave, Corporate Park, CP 34567',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
        $admin2->assignRole('admin');

        // Create Employee Users
        $employees = [
            [
                'name' => 'Michael Smith',
                'email' => 'michael@trackingapp.com',
                'phone_number' => '+1234567893',
                'department' => 'Sales',
                'position' => 'Sales Representative',
                'address' => '321 Field Road, Sales Town, ST 45678',
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily@trackingapp.com',
                'phone_number' => '+1234567894',
                'department' => 'Operations',
                'position' => 'Field Agent',
                'address' => '654 Worker Street, Field City, FC 56789',
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david@trackingapp.com',
                'phone_number' => '+1234567895',
                'department' => 'Logistics',
                'position' => 'Delivery Driver',
                'address' => '987 Transport Lane, Delivery Town, DT 67890',
            ],
            [
                'name' => 'Jennifer Brown',
                'email' => 'jennifer@trackingapp.com',
                'phone_number' => '+1234567896',
                'department' => 'Sales',
                'position' => 'Account Executive',
                'address' => '147 Commerce Blvd, Market City, MC 78901',
            ],
            [
                'name' => 'Robert Taylor',
                'email' => 'robert@trackingapp.com',
                'phone_number' => '+1234567897',
                'department' => 'Logistics',
                'position' => 'Warehouse Manager',
                'address' => '258 Storage Way, Warehouse District, WD 89012',
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa@trackingapp.com',
                'phone_number' => '+1234567898',
                'department' => 'Operations',
                'position' => 'Field Technician',
                'address' => '369 Service Road, Tech Valley, TV 90123',
            ],
            [
                'name' => 'James Martinez',
                'email' => 'james@trackingapp.com',
                'phone_number' => '+1234567899',
                'department' => 'Sales',
                'position' => 'Territory Manager',
                'address' => '741 Region Street, Coverage City, CC 01234',
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria@trackingapp.com',
                'phone_number' => '+1234567800',
                'department' => 'Operations',
                'position' => 'Site Supervisor',
                'address' => '852 Location Ave, Field Base, FB 12346',
            ],
        ];

        foreach ($employees as $employeeData) {
            $employee = User::create([
                'name' => $employeeData['name'],
                'email' => $employeeData['email'],
                'password' => Hash::make('password123'),
                'phone_number' => $employeeData['phone_number'],
                'department' => $employeeData['department'],
                'position' => $employeeData['position'],
                'address' => $employeeData['address'],
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $employee->assignRole('employee');
        }

        $this->command->info('Users seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('  - 1 Superadmin (superadmin@trackingapp.com)');
        $this->command->info('  - 2 Admins');
        $this->command->info('  - 8 Employees');
        $this->command->info('Default password for all users: password123');
    }
}
