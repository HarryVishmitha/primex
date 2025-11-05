<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\ClassBooking;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassBooked
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public readonly ClassBooking $booking)
    {
    }
}

