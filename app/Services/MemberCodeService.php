<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Member;
use Illuminate\Support\Str;

class MemberCodeService
{
    /**
     * Generate the next member code for a tenant.
     * Format: MBR-<TENANT>-<00001>
     */
    public function next(string $tenantId): string
    {
        $tenantPart = Str::upper(Str::substr($tenantId, 0, 4));
        $prefix = sprintf('MBR-%s-', $tenantPart);

        // Try to detect the last numeric suffix used with this prefix
        $lastCode = Member::query()
            ->forTenant($tenantId)
            ->where('code', 'LIKE', $prefix . '%')
            ->orderByDesc('created_at')
            ->value('code');

        $next = 1;
        if (is_string($lastCode) && preg_match('/^' . preg_quote($prefix, '/') . '(\d{5})$/', $lastCode, $m)) {
            $next = (int) $m[1] + 1;
        }

        return $prefix . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }
}
