<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TasksModel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tasks';
    protected $primaryKey = 'task_id';

    protected $fillable = [
        'title',
        'description',
        'location',
        'status',
        'start_time',
        'end_time',
        'manual_override',
    ];

    protected $casts = [
        'manual_override' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all task assignments
     */
    public function takenTasks()
    {
        return $this->hasMany(TakenTaskModel::class, 'task_id', 'task_id');
    }

    /**
     * Check if current time is within task working hours
     */
    public function isWithinWorkingHours()
    {
        $now = now();
        $currentTime = $now->format('H:i:s');

        $startTime = $this->start_time ? date('H:i:s', strtotime($this->start_time)) : '08:00:00';
        $endTime = $this->end_time ? date('H:i:s', strtotime($this->end_time)) : '17:00:00';

        return $currentTime >= $startTime && $currentTime <= $endTime;
    }

    /**
     * Get the computed status based on time (if not manually overridden)
     */
    public function getComputedStatus()
    {
        // If manually overridden, return the stored status
        if ($this->manual_override) {
            return $this->attributes['status'];
        }

        // Otherwise, compute based on time
        return $this->isWithinWorkingHours() ? 'active' : 'inactive';
    }

    /**
     * Get status attribute - returns computed status if not manually overridden
     */
    public function getStatusAttribute($value)
    {
        // If manually overridden, return the stored status
        if ($this->manual_override) {
            return $value;
        }

        // Otherwise, compute based on time
        return $this->isWithinWorkingHours() ? 'active' : 'inactive';
    }

    /**
     * Get all users who have been assigned this task (from all assignments)
     */
    public function assignedUsers()
    {
        $userIds = [];
        $assignments = $this->takenTasks;

        foreach ($assignments as $assignment) {
            if ($assignment->user_ids) {
                $userIds = array_merge($userIds, $assignment->user_ids);
            }
        }

        $userIds = array_unique($userIds);

        return User::whereIn('id', $userIds)->get();
    }
}
