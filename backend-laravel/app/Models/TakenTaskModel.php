<?php

namespace App\Models;

use App\Models\User;
use App\Traits\GeneratesTickets;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class TakenTaskModel extends Model
{
    use HasFactory, HasUuids, GeneratesTickets;

    protected $table = 'taken_tasks';
    protected $primaryKey = 'taken_task_id';
    protected $ticketPrefix = 'TT';

    protected $fillable = [
        'user_ids',
        'task_id',
        'start_time',
        'end_time',
        'date',
        'status',
        'ticket_number',
    ];

    protected $casts = [
        'user_ids' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['is_within_work_hours', 'computed_status'];

    /**
     * Boot method to auto-generate ticket numbers
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->generateTicketNumber();
        });
    }

    /**
     * Get the task this assignment belongs to
     */
    public function task()
    {
        return $this->belongsTo(TasksModel::class, 'task_id', 'task_id');
    }

    /**
     * Check if current time is within task's work hours
     */
    public function isWithinWorkHours()
    {
        if (!$this->task) {
            return false;
        }

        $now = now();
        $currentTime = $now->format('H:i:s');

        $taskStartTime = $this->task->start_time ?? '08:00:00';
        $taskEndTime = $this->task->end_time ?? '17:00:00';

        // Log for debugging
        Log::info('Work hours check', [
            'task_id' => $this->task_id,
            'current_time' => $currentTime,
            'start_time' => $taskStartTime,
            'end_time' => $taskEndTime,
            'comparison' => [
                'current >= start' => ($currentTime >= $taskStartTime),
                'current <= end' => ($currentTime <= $taskEndTime),
            ],
            'result' => ($currentTime >= $taskStartTime && $currentTime <= $taskEndTime)
        ]);

        return $currentTime >= $taskStartTime && $currentTime <= $taskEndTime;
    }

    /**
     * Get computed status based on work hours
     */
    public function getComputedStatus()
    {
        $dbStatus = $this->attributes['status'] ?? 'pending';

        // If task is already completed, keep it completed
        if ($dbStatus === 'completed') {
            return 'completed';
        }

        // If task is in progress, keep it in progress (employee is working)
        if ($dbStatus === 'in progress') {
            return 'in progress';
        }

        // For pending tasks, check work hours
        if ($dbStatus === 'pending') {
            return $this->isWithinWorkHours() ? 'pending' : 'inactive';
        }

        return $dbStatus;
    }

    /**
     * Accessor for is_within_work_hours
     */
    public function getIsWithinWorkHoursAttribute()
    {
        return $this->isWithinWorkHours();
    }

    /**
     * Accessor for computed_status
     */
    public function getComputedStatusAttribute()
    {
        return $this->getComputedStatus();
    }

    /**
     * Get all users assigned to this task
     */
    public function getUsers()
    {
        // Since user_ids is stored as JSON array, we need to fetch users manually
        if (!$this->user_ids) {
            return collect([]);
        }

        return User::whereIn('id', $this->user_ids)->get();
    }

    /**
     * Check if a specific user is assigned to this task
     */
    public function hasUser($userId)
    {
        return in_array($userId, $this->user_ids ?? []);
    }

    /**
     * Add a user to this assignment
     */
    public function addUser($userId)
    {
        $userIds = $this->user_ids ?? [];
        if (!in_array($userId, $userIds)) {
            $userIds[] = $userId;
            $this->update(['user_ids' => $userIds]);
        }
    }

    /**
     * Remove a user from this assignment
     */
    public function removeUser($userId)
    {
        $userIds = $this->user_ids ?? [];
        $userIds = array_values(array_diff($userIds, [$userId]));
        $this->update(['user_ids' => $userIds]);
    }

    /**
     * Get all location records for this task assignment
     */
    public function locations()
    {
        return $this->hasMany(LocationModel::class, 'taken_task_id', 'taken_task_id');
    }

    /**
     * Get location records for a specific user in this task
     */
    public function userLocations($userId)
    {
        return $this->locations()->where('user_id', $userId)->orderBy('recorded_at', 'desc');
    }
}
