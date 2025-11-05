<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\AsUlidString;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketMessage extends TenantModel
{
    protected $fillable = [
        'tenant_id',
        'ticket_id',
        'sender_id',
        'body',
        'sent_at',
    ];

    protected $casts = [
        'id' => AsUlidString::class,
        'tenant_id' => AsUlidString::class,
        'ticket_id' => AsUlidString::class,
        'sender_id' => AsUlidString::class,
        'sent_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}

