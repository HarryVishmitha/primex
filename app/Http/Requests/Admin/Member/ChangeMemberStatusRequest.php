<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Member;

use Illuminate\Foundation\Http\FormRequest;

class ChangeMemberStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:prospect,active,inactive,suspended'],
        ];
    }

    public function tenantId(): string
    {
        if (app()->bound('tenancy') && tenancy()->initialized) {
            return tenant()->getTenantKey();
        }

        $tenantId = $this->user()?->tenant_id;

        if (! $tenantId) {
            abort(403, 'Tenant context missing for request.');
        }

        return $tenantId;
    }
}
