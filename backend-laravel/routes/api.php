<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RolePermissionController;
use App\Http\Controllers\API\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/test', function () {
    return response()->json([
        'message' => 'API Connected'
    ]);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles', 'permissions');
    });

    // Roles and Permissions management (superadmin and admin only)
    Route::middleware('role:superadmin|admin')->prefix('admin')->group(function () {
        // Roles
        Route::get('/roles', [RolePermissionController::class, 'getRoles']);
        Route::post('/roles', [RolePermissionController::class, 'createRole']);
        Route::post('/roles/{roleId}/permissions', [RolePermissionController::class, 'syncRolePermissions']);

        // Permissions
        Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
        Route::post('/permissions', [RolePermissionController::class, 'createPermission']);

        // User role/permission management
        Route::post('/users/{userId}/roles', [RolePermissionController::class, 'assignRole']);
        Route::delete('/users/{userId}/roles', [RolePermissionController::class, 'removeRole']);
        Route::post('/users/{userId}/permissions', [RolePermissionController::class, 'givePermission']);
        Route::delete('/users/{userId}/permissions', [RolePermissionController::class, 'revokePermission']);

        // User management
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);
        Route::get('/departments', [UserController::class, 'departments']);
    });

    // Superadmin only routes
    Route::middleware('role:superadmin')->prefix('admin')->group(function () {
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // User profile routes (any authenticated user can access their own profile)
    Route::prefix('profile')->group(function () {
        Route::put('/{id}', [UserController::class, 'update']);
        Route::post('/{id}/avatar', [UserController::class, 'uploadAvatar']);
    });

    // Add your other protected routes here
});
