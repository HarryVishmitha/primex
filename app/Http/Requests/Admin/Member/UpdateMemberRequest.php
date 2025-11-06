<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Member;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
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
            'full_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'gender' => ['sometimes', 'nullable', 'string', 'in:male,female,other'],
            'dob' => ['sometimes', 'nullable', 'date'],
            'branch_id' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'nullable', 'string', 'in:prospect,active,inactive,suspended'],
            'code' => ['sometimes', 'nullable', 'string', 'max:50'],
            'user_id' => ['sometimes', 'nullable', 'string'],
            'emergency_contact' => ['sometimes', 'nullable', 'array'],
            'emergency_contact.name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'emergency_contact.phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'emergency_contact.relationship' => ['sometimes', 'nullable', 'string', 'max:100'],
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
