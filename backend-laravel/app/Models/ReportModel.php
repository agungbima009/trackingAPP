<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use App\Traits\GeneratesTickets;

class ReportModel extends Model
{
    use HasFactory, HasUuids, GeneratesTickets;

    protected $table = 'reports';
    protected $primaryKey = 'report_id';
    protected $ticketPrefix = 'RPT';

    protected $fillable = [
        'user_id',
        'taken_task_id',
        'report',
        'image',
        'ticket_number',
    ];

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
