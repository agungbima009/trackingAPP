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
    ];

    protected $casts = [
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
