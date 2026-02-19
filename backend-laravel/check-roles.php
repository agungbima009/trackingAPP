<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Role;

echo "Checking roles in database...\n";
echo "============================\n\n";

try {
    $roles = Role::all();
    
    if ($roles->count() > 0) {
        echo "Found " . $roles->count() . " roles:\n\n";
        foreach ($roles as $role) {
            echo "  - Name: {$role->name}\n";
            echo "    Guard: {$role->guard_name}\n";
            echo "    ID: {$role->id}\n\n";
        }
    } else {
        echo "No roles found in database!\n";
        echo "Please run: php artisan db:seed --class=RolePermissionSeeder\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
