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
        'timestamp',
    ];
    protected $primaryKey = 'report_id';
}
