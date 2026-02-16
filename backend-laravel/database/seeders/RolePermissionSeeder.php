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
            
            // Add more permissions as needed for your app
            'view dashboard',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin role - has all permissions
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        // Moderator role - has some permissions
        $moderator = Role::firstOrCreate(['name' => 'moderator']);
        $moderator->syncPermissions([
            'view users',
            'edit users',
            'view roles',
            'view permissions',
            'view dashboard',
        ]);

        // User role - basic permissions
        $user = Role::firstOrCreate(['name' => 'user']);
        $user->syncPermissions([
            'view dashboard',
        ]);

        // NOTE: To create test users, use the registration API endpoint
        // or create users manually via tinker after seeding

        $this->command->info('Roles and permissions seeded successfully!');
        $this->command->info('You can now create users via the /api/auth/register endpoint');
        $this->command->info('Or create an admin user manually and assign roles');
    }
}
