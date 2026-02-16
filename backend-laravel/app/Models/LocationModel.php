<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class LocationModel extends Model
{
    use HasFactory, HasUuids;
    protected $table = 'locations';
    protected $fillable = [
        'user_id',
        'taken_task_id',
        'latitude',
        'longitude',
        'timestamp',
    ];
    protected $primaryKey = 'location_id';
}
