<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RolePermissionController;
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
    
    // Roles and Permissions management (admin only)
    Route::middleware('role:admin')->prefix('admin')->group(function () {
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
    });
    
    // Add your other protected routes here
});


