<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RolePermissionController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\TakenTaskController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\TicketingController;
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
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);
        Route::get('/departments', [UserController::class, 'departments']);

        // Task Management
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::get('/tasks/statistics', [TaskController::class, 'statistics']);
        Route::get('/tasks/by-location', [TaskController::class, 'byLocation']);
        Route::post('/tasks/{id}/reset-auto', [TaskController::class, 'resetToAuto']);
        Route::post('/tasks/{id}/mark-completed', [TaskController::class, 'markAsCompleted']);
        Route::get('/tasks/{id}', [TaskController::class, 'show']);
        Route::put('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
        Route::post('/tasks/{id}/assign', [TaskController::class, 'assignToUsers']);

        // Task Assignment Management
        Route::get('/assignments', [TakenTaskController::class, 'index']);
        Route::post('/assignments', [TakenTaskController::class, 'store']);
        Route::get('/assignments/{id}', [TakenTaskController::class, 'show']);
        Route::put('/assignments/{id}', [TakenTaskController::class, 'update']);
        Route::delete('/assignments/{id}', [TakenTaskController::class, 'destroy']);
        Route::put('/assignments/{id}/cancel', [TakenTaskController::class, 'cancelTask']);
        Route::get('/users/{userId}/statistics', [TakenTaskController::class, 'userStatistics']);
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

    // Employee Task Routes (view and manage own tasks)
    Route::prefix('my-tasks')->group(function () {
        Route::get('/', [TakenTaskController::class, 'myTasks']);
        Route::get('/statistics', [TakenTaskController::class, 'myStatistics']);
        Route::put('/{id}/start', [TakenTaskController::class, 'startTask']);
        Route::put('/{id}/complete', [TakenTaskController::class, 'completeTask']);
    });

    // Location Tracking Routes

    // Employee routes - record locations
    Route::prefix('locations')->group(function () {
        Route::post('/', [LocationController::class, 'store']); // Record single location
        Route::post('/batch', [LocationController::class, 'storeBatch']); // Record multiple locations
        Route::get('/my', [LocationController::class, 'myLocations']); // Get own location history
        Route::get('/my/statistics', [LocationController::class, 'userStatistics']); // Get own statistics
        Route::get('/tasks/{takenTaskId}', [LocationController::class, 'getTaskLocations']); // Get locations for assigned task
        Route::get('/tasks/{takenTaskId}/route', [LocationController::class, 'getRoute']); // Get route/path for a task
    });

    // Admin location management routes
    Route::middleware('role:superadmin|admin')->prefix('admin/locations')->group(function () {
        Route::get('/tasks/{takenTaskId}', [LocationController::class, 'getTaskLocations']); // View task locations
        Route::get('/tasks/{takenTaskId}/current', [LocationController::class, 'getCurrentLocations']); // Current locations
        Route::get('/tasks/{takenTaskId}/statistics', [LocationController::class, 'taskStatistics']); // Task statistics
        Route::get('/tasks/{takenTaskId}/route', [LocationController::class, 'getRoute']); // Get route/path
        Route::get('/users/{userId}/statistics', [LocationController::class, 'userStatistics']); // User statistics
        Route::get('/nearby', [LocationController::class, 'getNearby']); // Find locations near coordinates
        Route::delete('/{locationId}', [LocationController::class, 'destroy']); // Delete location record
    });

    // Report Routes

    // Employee routes - create and view own reports
    Route::prefix('reports')->group(function () {
        Route::post('/', [ReportController::class, 'store']); // Create new report
        Route::get('/my', [ReportController::class, 'myReports']); // Get own reports
        Route::get('/{id}', [ReportController::class, 'show']); // View report details
        Route::put('/{id}', [ReportController::class, 'update']); // Update own report
        Route::get('/statistics/my', [ReportController::class, 'statistics']); // Get own statistics
    });

    // Admin report management routes
    Route::middleware('role:superadmin|admin')->prefix('admin/reports')->group(function () {
        Route::get('/', [ReportController::class, 'index']); // Get all reports
        Route::get('/tasks/{taskId}', [ReportController::class, 'taskReports']); // Get reports for specific task
        Route::get('/statistics', [ReportController::class, 'statistics']); // Get overall statistics
        Route::delete('/{id}', [ReportController::class, 'destroy']); // Delete report
    });

    // Ticketing Routes - Available to all authenticated users
    Route::prefix('tickets')->group(function () {
        Route::get('/', [TicketingController::class, 'index']); // Get all tickets with filters
        Route::get('/number/{ticketNumber}', [TicketingController::class, 'getByTicketNumber']); // Get ticket by number
        Route::get('/search', [TicketingController::class, 'search']); // Search tickets
        Route::get('/statistics', [TicketingController::class, 'statistics']); // Get ticket statistics
    });

    // Add your other protected routes here
});
