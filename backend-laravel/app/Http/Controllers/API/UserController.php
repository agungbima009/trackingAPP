<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users (Admin/Superadmin only)
     */
    public function index(Request $request)
    {
        $query = User::with('roles', 'permissions');

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Search by name, email, or employee_id
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Create a new user (Admin/Superadmin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:employee,admin,superadmin',
            'phone_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive'
        ]);

        try {
            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone_number' => $request->phone_number,
                'department' => $request->department,
                'position' => $request->position,
                'address' => $request->address,
                'status' => $request->status ?? 'active'
            ]);

            // Assign role with explicit guard
            $roleName = $request->role;
            
            // Verify role exists
            $role = \Spatie\Permission\Models\Role::where('name', $roleName)
                ->where('guard_name', 'web')
                ->first();
            
            if (!$role) {
                // Create role if it doesn't exist
                $role = \Spatie\Permission\Models\Role::create([
                    'name' => $roleName,
                    'guard_name' => 'web'
                ]);
            }
            
            // Assign role to user
            $user->assignRole($role);
            
            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            
            // Reload user with relationships
            $user->load('roles', 'permissions');

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error creating user: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific user details
     */
    public function show($id)
    {
        $user = User::with('roles', 'permissions')->findOrFail($id);

        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Check if user can update this profile
        $authUser = $request->user();
        if ($authUser->id !== $user->id && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized to update this profile'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone_number' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $data = $request->except(['password', 'password_confirmation']);

        // Only update password if provided
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Update user status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => $user->load('roles', 'permissions')
        ]);
    }

    /**
     * Delete user (Superadmin only)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get departments list
     */
    public function departments()
    {
        $departments = User::whereNotNull('department')
            ->distinct()
            ->pluck('department');

        return response()->json([
            'departments' => $departments
        ]);
    }

    /**
     * Upload user avatar
     */
    public function uploadAvatar(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Check authorization
        $authUser = $request->user();
        if ($authUser->id !== $user->id && !$authUser->hasAnyRole(['admin', 'superadmin'])) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::exists($user->avatar)) {
                Storage::delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => Storage::url($path)
            ]);
        }

        return response()->json([
            'message' => 'No file uploaded'
        ], 400);
    }
}
