<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationModel extends Model
{
    use HasFactory, HasUuids;
    
    protected $table = 'locations';
    protected $primaryKey = 'location_id';

    protected $fillable = [
        'user_id',
        'taken_task_id',
        'latitude',
        'longitude',
        'accuracy',
        'address',
        'tracking_status',
        'recorded_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'accuracy' => 'decimal:2',
        'recorded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who owns this location record
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the task assignment this location belongs to
     */
    public function takenTask()
    {
        return $this->belongsTo(TakenTaskModel::class, 'taken_task_id', 'taken_task_id');
    }

    /**
     * Scope to get locations within a date range
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('recorded_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get recent locations
     */
    public function scopeRecent($query, $minutes = 60)
    {
        return $query->where('recorded_at', '>=', now()->subMinutes($minutes));
    }

    /**
     * Get distance between two coordinates (in kilometers)
     */
    public static function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }
}
