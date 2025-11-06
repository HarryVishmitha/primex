<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Member;

use Illuminate\Foundation\Http\FormRequest;

class MemberIndexRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $input = $this->all();

        if (isset($input['status']) && is_string($input['status'])) {
            $input['status'] = array_filter(
                array_map('trim', explode(',', $input['status']))
            );
        }

        if (array_key_exists('plan_status', $input) && $input['plan_status'] === '') {
            $input['plan_status'] = null;
        }

        if (array_key_exists('has_debt', $input) && $input['has_debt'] !== null) {
            if ($input['has_debt'] === '' || $input['has_debt'] === 'null') {
                $input['has_debt'] = null;
            } elseif (! is_bool($input['has_debt'])) {
                $input['has_debt'] = filter_var(
                    $input['has_debt'],
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
            }
        }

        if (array_key_exists('deleted', $input) && $input['deleted'] === '') {
            $input['deleted'] = 'without';
        }

        if (array_key_exists('per_page', $input) && $input['per_page'] !== null) {
            $input['per_page'] = (int) $input['per_page'];
        }

        if (array_key_exists('page', $input) && $input['page'] !== null) {
            $input['page'] = (int) $input['page'];
        }

        if (array_key_exists('debug', $input) && ! is_bool($input['debug'])) {
            $input['debug'] = filter_var(
                $input['debug'],
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );
        }

        if (array_key_exists('raw', $input) && ! is_bool($input['raw'])) {
            $input['raw'] = filter_var(
                $input['raw'],
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );
        }

        $this->replace($input);
    }

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
            'status' => ['nullable', 'array'],
            'status.*' => ['string', 'in:prospect,active,inactive,suspended'],
            'branch_id' => ['nullable', 'string'],
            'plan_status' => ['nullable', 'in:active,expired,none'],
            'has_debt' => ['nullable', 'boolean'],
            'q' => ['nullable', 'string', 'max:255'],
            'deleted' => ['nullable', 'in:without,with,only'],
            'sort' => [
                'nullable',
                'in:created_at,updated_at,full_name,status,code,last_payment_at,next_expiry_at,balance_due_cents,attendance_count',
            ],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'debug' => ['nullable', 'boolean'],
            'raw' => ['nullable', 'boolean'],
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

