<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait to auto-generate unique ticket numbers for models
 * 
 * Usage in your model:
 * - Add use GeneratesTickets in your model class
 * - Define protected $ticketPrefix = 'TSK' in your model
 * - Add event listener in boot() method: static::creating(fn($model) => $model->generateTicketNumber())
 * 
 * Format: PREFIX-XXXXXX (e.g., TSK-000001)
 */
trait GeneratesTickets
{
    /**
     * Generate a unique ticket number before creating model
     */
    public function generateTicketNumber(): void
    {
        if (empty($this->ticket_number)) {
            $prefix = $this->ticketPrefix ?? 'TKT';

            // Get the next ticket number based on count
            $count = static::whereNotNull('ticket_number')->count();
            $number = str_pad($count + 1, 6, '0', STR_PAD_LEFT);

            $this->ticket_number = "{$prefix}-{$number}";
        }
    }

    /**
     * Generate a ticket number with a specific format
     * 
     * @param string $prefix The prefix for the ticket (e.g., 'TSK', 'TT', 'RPT')
     * @return string The generated ticket number
     */
    public static function generateUniqueTicket(string $prefix): string
    {
        $count = static::whereNotNull('ticket_number')->count();
        $number = str_pad($count + 1, 6, '0', STR_PAD_LEFT);

        return "{$prefix}-{$number}";
    }

    /**
     * Get the next ticket number without saving
     * 
     * @return string The next ticket number
     */
    public static function getNextTicketNumber(string $prefix = null): string
    {
        $prefix = $prefix ?? 'TKT';
        $count = static::whereNotNull('ticket_number')->count();
        $number = str_pad($count + 1, 6, '0', STR_PAD_LEFT);

        return "{$prefix}-{$number}";
    }
}
