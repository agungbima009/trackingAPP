<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionController extends Controller
{
    /**
     * Get all roles
     */
    public function getRoles()
    {
        $roles = Role::with('permissions')->get();
        
        return response()->json([
            'roles' => $roles
        ]);
    }

    /**
     * Get all permissions
     */
    public function getPermissions()
    {
        $permissions = Permission::all();
        
        return response()->json([
            'permissions' => $permissions
        ]);
    }

    /**
     * Create a new role
     */
    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role->load('permissions')
        ], 201);
    }

    /**
     * Create a new permission
     */
    public function createPermission(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        $permission = Permission::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Permission created successfully',
            'permission' => $permission
        ], 201);
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, $userId)
    {
        $request->validate([
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::findOrFail($userId);
        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, $userId)
    {
        $request->validate([
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::findOrFail($userId);
        $user->removeRole($request->role);

        return response()->json([
            'message' => 'Role removed successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Give permission to user
     */
    public function givePermission(Request $request, $userId)
    {
        $request->validate([
            'permission' => 'required|exists:permissions,name'
        ]);

        $user = User::findOrFail($userId);
        $user->givePermissionTo($request->permission);

        return response()->json([
            'message' => 'Permission granted successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Revoke permission from user
     */
    public function revokePermission(Request $request, $userId)
    {
        $request->validate([
            'permission' => 'required|exists:permissions,name'
        ]);

        $user = User::findOrFail($userId);
        $user->revokePermissionTo($request->permission);

        return response()->json([
            'message' => 'Permission revoked successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Sync permissions to role
     */
    public function syncRolePermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        $role = Role::findOrFail($roleId);
        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Role permissions synced successfully',
            'role' => $role->load('permissions')
        ]);
    }
}
