<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use DateTimeInterface;

class MemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $m = $this->resource;

        $data = [
            'id' => (string) $this->id,
            'tenant_id' => (string) $this->tenant_id,
            'code' => $this->code,
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'dob' => $this->dob?->toDateString(),
            'phone' => $this->phone,
            'email' => $this->email,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'branch' => $this->whenLoaded('branch', function () {
                return $this->branch ? [
                    'id' => (string) $this->branch->id,
                    'name' => $this->branch->name,
                ] : null;
            }, $this->branch ? [
                'id' => (string) ($this->branch->id ?? ''),
                'name' => $this->branch->name ?? null,
            ] : null),
            'user_id' => $this->user_id ? (string) $this->user_id : null,
            'emergency_contact' => $this->emergency_contact,
            'next_expiry_at' => $this->formatIso8601($this->next_expiry_at),
            'last_payment_at' => $this->formatIso8601($this->last_payment_at),
            'balance_due_cents' => (int) ($this->balance_due_cents ?? 0),
            'avatar_url' => method_exists($this->resource, 'getFirstMediaUrl') ? $this->resource->getFirstMediaUrl('avatar') : null,
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'attendance_count' => (int) ($this->attendance_count ?? 0),
            'latest_subscription' => $this->whenLoaded('latestSubscription', function () {
                return $this->latestSubscription ? [
                    'id' => (string) $this->latestSubscription->id,
                    'status' => $this->latestSubscription->status,
                    'starts_at' => $this->latestSubscription->starts_at?->toIso8601String(),
                    'ends_at' => $this->latestSubscription->ends_at?->toIso8601String(),
                    'auto_renew' => (bool) $this->latestSubscription->auto_renew,
                    'plan' => $this->latestSubscription->plan ? [
                        'id' => (string) $this->latestSubscription->plan->id,
                        'name' => $this->latestSubscription->plan->name,
                    ] : null,
                ] : null;
            }),
        ];

        // Include collections only when explicitly loaded (e.g. in show action)
        if ($this->relationLoaded('subscriptions')) {
            $data['subscriptions'] = $this->subscriptions?->map(function ($s) {
                return [
                    'id' => (string) $s->id,
                    'status' => $s->status,
                    'starts_at' => $s->starts_at?->toIso8601String(),
                    'ends_at' => $s->ends_at?->toIso8601String(),
                    'auto_renew' => (bool) $s->auto_renew,
                    'plan' => $s->plan ? [
                        'id' => (string) $s->plan->id,
                        'name' => $s->plan->name,
                    ] : null,
                ];
            })->all();
        }

        if ($this->relationLoaded('payments')) {
            $data['payments'] = $this->payments?->map(function ($p) {
                return [
                    'id' => (string) $p->id,
                    'invoice_id' => $p->invoice_id ? (string) $p->invoice_id : null,
                    'status' => $p->status,
                    'method' => $p->method,
                    'amount_cents' => $p->amount_cents?->toInteger() ?? 0,
                    'paid_at' => $p->paid_at?->toIso8601String(),
                ];
            })->all();
        }

        if ($this->relationLoaded('invoices')) {
            $data['invoices'] = $this->invoices?->map(function ($i) {
                return [
                    'id' => (string) $i->id,
                    'number' => $i->number,
                    'status' => $i->status,
                    'total_cents' => $i->total_cents?->toInteger() ?? 0,
                    'issued_at' => $i->issued_at?->toIso8601String(),
                    'due_at' => $i->due_at?->toIso8601String(),
                ];
            })->all();
        }

        if ($this->relationLoaded('attendanceLogs')) {
            $data['attendance_logs'] = $this->attendanceLogs?->map(function ($a) {
                return [
                    'id' => (string) $a->id,
                    'checked_in_at' => $a->checked_in_at?->toIso8601String(),
                    'checked_out_at' => $a->checked_out_at?->toIso8601String(),
                    'source' => $a->source,
                ];
            })->all();
        }

        return $data;
    }
    
    private function formatIso8601(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            // Use Carbon's ISO8601 if available, else fallback to ATOM
            return $value instanceof Carbon
                ? $value->toIso8601String()
                : $value->format(DATE_ATOM);
        }

        if (is_string($value) && $value !== '') {
            try {
                return Carbon::parse($value)->toIso8601String();
            } catch (\Throwable) {
                return null;
            }
        }

        return null;
    }
}
