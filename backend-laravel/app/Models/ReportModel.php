<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReportModel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'reports';

    protected $fillable = [
        'user_id',
        'taken_task_id',
        'report',
        'image',
    ];

    protected $primaryKey = 'report_id';

    /**
     * Get the user who created this report
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the task assignment this report belongs to
     */
    public function takenTask()
    {
        return $this->belongsTo(TakenTaskModel::class, 'taken_task_id', 'taken_task_id');
    }

    /**
     * Get photos as array
     */
    public function getPhotosAttribute()
    {
        return json_decode($this->image, true) ?? [];
    }
}
