<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TakenTaskModel extends Model
{
    use HasFactory, HasUuids;
    protected $table = 'taken_tasks';
    protected $fillable = [
        'users_id',
        'task_id',
        'start_time',
        'end_time',
        'date',
        'status',
    ];
    protected $primaryKey = 'taken_task_id';
}
