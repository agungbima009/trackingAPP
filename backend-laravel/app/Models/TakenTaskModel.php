<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TakenTaskModel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'taken_tasks';
    protected $primaryKey = 'taken_task_id';

    protected $fillable = [
        'user_ids',
        'task_id',
        'start_time',
        'end_time',
        'date',
        'status',
    ];

    protected $casts = [
        'user_ids' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the task this assignment belongs to
     */
    public function task()
    {
        return $this->belongsTo(TasksModel::class, 'task_id', 'task_id');
    }

    /**
     * Get all users assigned to this task
     */
    public function users()
    {
        // Since user_ids is stored as JSON array, we need to fetch users manually
        if (!$this->user_ids) {
            return collect([]);
        }

        return User::whereIn('id', $this->user_ids)->get();
    }

    /**
     * Get users attribute (for eager loading compatibility)
     */
    public function getUsersAttribute()
    {
        return $this->users();
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
