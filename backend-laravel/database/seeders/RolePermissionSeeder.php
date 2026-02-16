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
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions

        // SuperAdmin role - has all permissions
        $superadmin = Role::firstOrCreate(['name' => 'superadmin']);
        $superadmin->syncPermissions(Permission::all());

        // Admin role - can manage users and view all data
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'view locations',
            'create locations',
            'view reports',
            'export reports',
            'view dashboard',
            'view analytics',
            'view settings',
        ]);

        // Employee role - basic tracking permissions
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'view own locations',
            'create own locations',
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
