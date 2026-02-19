# New Task and Taken Task Status Workflow

## Overview

The task management system has been updated with a new status workflow that provides clearer state management for tasks and their assignments.

## Status Workflows

### Task Status Flow

```
active (during work hours) ←→ inactive (outside work hours)
           ↓
         pending (when admin assigns to employee)
           ↓
        completed (when admin marks as complete)
```

**Status Descriptions:**
- **active**: Task is available during working hours (08:00 - 17:00 by default). Status automatically changes to `inactive` outside working hours.
- **inactive**: Task is outside working hours
- **pending**: Task has been assigned to employees and awaits completion
- **completed**: Task has been confirmed as completed by admin

### Taken Task (Assignment) Status Flow

```
pending (when assigned)
   ↓
in_progress (when employee starts)
   ↓
completed (when employee submits report)
```

**Status Descriptions:**
- **pending**: Assignment created, waiting for employee to start
- **in_progress**: Employee has started working on the task
- **completed**: Employee has submitted their report/completed the work

## Implementation Details

### Backend Changes

#### 1. TaskController.php

**Updated `assignToUsers()` method:**
- When admin assigns a task to employees, the task status is automatically set from `active` to `pending`
- Sets `manual_override = true` to lock the status until completion

```php
// Update task status to 'pending' when assigning
$task->update([
    'status' => 'pending',
    'manual_override' => true
]);
```

**New `markAsCompleted()` method:**
- Admin endpoint to confirm task completion after employees submit reports
- Only works when task status is `pending`
- Requires at least one completed taken task assignment
- Endpoint: `POST /api/admin/tasks/{id}/mark-completed`

```php
public function markAsCompleted(Request $request, $id)
{
    // Task must be in pending status
    // Check if there are completed taken tasks
    // Update task to completed
}
```

#### 2. API Routes (routes/api.php)

**New route added:**
```php
Route::post('/tasks/{id}/mark-completed', [TaskController::class, 'markAsCompleted']);
```

### Frontend Changes

#### 1. api.js (services)

**New function added:**
```javascript
export const markTaskAsCompleted = async (taskId) => {
  const response = await api.post(`/admin/tasks/${taskId}/mark-completed`);
  return response.data;
};
```

#### 2. Task.jsx

**Updated imports:**
- Added `markTaskAsCompleted` to the imports from API service

**Updated `handleMarkAsCompleted()` method:**
- Now uses the new `markTaskAsCompleted()` API endpoint
- Displays better error messages from the backend
- Only shows the button when task status is not `completed`

```jsx
const handleMarkAsCompleted = async (taskId) => {
  showConfirmModal(
    'Tandai Selesai',
    'Tandai task ini sebagai selesai? (Hanya task dengan status pending dapat ditandai selesai)',
    async () => {
      try {
        await markTaskAsCompleted(taskId);
        showToast('Task berhasil ditandai sebagai selesai!', 'success');
        loadTasks();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Gagal...';
        showToast(errorMessage, 'error');
      }
    },
    'complete'
  );
};
```

### API Documentation Updates

**Added Task Status Workflow section** explaining:
- Task status flow diagram
- Taken task status flow diagram
- Example workflow through the complete lifecycle

**Updated `POST /api/admin/tasks/{id}/assign` endpoint:**
- Now documents that task status changes from `active` to `pending`
- Explains the taken task status is set to `pending`

**New `POST /api/admin/tasks/{id}/mark-completed` endpoint documented:**
- Request: No body required
- Response: Returns updated task with completed status
- Error cases: Invalid status, no completed assignments

**Updated Quick Reference Table:**
- Added `POST /api/admin/tasks/{id}/mark-completed` entry

## Example Workflow

### 1. Create Task
Admin creates a task (status: `active` if within work hours)
```bash
curl -X POST http://localhost:8000/api/admin/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Client Meeting",
    "description": "Meet with client",
    "location": "Downtown Office",
    "start_time": "08:00:00",
    "end_time": "17:00:00"
  }'
```

### 2. Assign Task to Employee
Admin assigns task → Task status: `pending`, Taken Task status: `pending`
```bash
curl -X POST http://localhost:8000/api/admin/tasks/{taskId}/assign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["employee-uuid"],
    "date": "2026-02-19"
  }'
```

### 3. Employee Starts Task
Employee clicks "Start" → Taken Task status: `in_progress`
```bash
curl -X PUT http://localhost:8000/api/my-tasks/{assignmentId}/start \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

### 4. Employee Completes Task
Employee clicks "Complete" → Taken Task status: `completed`
```bash
curl -X PUT http://localhost:8000/api/my-tasks/{assignmentId}/complete \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

### 5. Admin Confirms Completion
Admin marks task as complete → Task status: `completed`
```bash
curl -X POST http://localhost:8000/api/admin/tasks/{taskId}/mark-completed \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Key Features

✅ **Automatic Status Management**: Task status automatically changes between active/inactive based on working hours

✅ **Clear Status Progression**: Each entity (Task and Taken Task) has a clear progression through states

✅ **Admin Confirmation**: Admin must explicitly mark tasks as complete for better control

✅ **Data Integrity**: 
- Task can only move to completed if assignments are completed
- Status validation prevents invalid state transitions
- Manual override prevents auto-status changes when needed

✅ **Employee Task Management**: Employees can still start and complete their own task assignments

## Testing the New Workflow

After running `php artisan migrate:fresh --seed`, you can test:

1. **Login as Admin:**
   - Email: `admin@trackingapp.com`
   - Password: `password123`

2. **View Tasks:**
   - Navigate to Task Management page
   - Tasks with status `pending` will show a "Mark as Complete" button

3. **Assign Task:**
   - Click on a task
   - Assign to employees
   - Task status automatically changes to `pending`

4. **Complete Task:**
   - Wait for employees to submit reports
   - Click "Mark as Complete" button on the task
   - Task status changes to `completed`

## Database Changes

All changes utilize existing database tables:
- `tasks` table: Already has `status` and `manual_override` columns
- `taken_tasks` table: Already has `status` column
- No new migrations were required

## Backward Compatibility

✓ All existing endpoints continue to work
✓ Existing task queries and filters function properly
✓ No breaking changes to API contracts
✓ Frontend components gracefully handle new status values
