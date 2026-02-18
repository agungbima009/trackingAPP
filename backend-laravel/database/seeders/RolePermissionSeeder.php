<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Role management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',

            // Permission management
            'view permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',

            // Task management
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
            'view own tasks',
            'manage own tasks',

            // Location tracking
            'view locations',
            'create locations',
            'edit locations',
            'delete locations',
            'view own locations',
            'create own locations',

            // Reports
            'view reports',
            'create reports',
            'export reports',

            // Dashboard
            'view dashboard',
            'view analytics',

            // Settings
            'manage settings',
            'view settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create roles and assign permissions

        // SuperAdmin role - has all permissions
        $superadmin = Role::firstOrCreate([
            'name' => 'superadmin',
            'guard_name' => 'web'
        ]);
        $superadmin->syncPermissions(Permission::all());

        // Admin role - can manage users and view all data
        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);
        $admin->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
            'view locations',
            'view reports',
            'export reports',
            'view dashboard',
            'view analytics',
            'view settings',
        ]);

        // Employee role - basic tracking permissions
        $employee = Role::firstOrCreate([
            'name' => 'employee',
            'guard_name' => 'web'
        ]);
        $employee->syncPermissions([
            'view own tasks',
            'manage own tasks',
            'view own locations',
            'create own locations',
            'view reports',
            'create reports',
            'view dashboard',
        ]);

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('');
        $this->command->info('Created roles:');
        $this->command->info('  - superadmin: Full system access');
        $this->command->info('  - admin: User & location management');
        $this->command->info('  - employee: Can track own location');
        $this->command->info('');
        $this->command->info('Use /api/auth/register to create users and assign roles via admin panel');
    }
}
