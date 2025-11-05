<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberWebController extends Controller
{
    public function index(Request $request): Response
    {
        $branches = Branch::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $user = $request->user();

        // Options/config the frontend needs for filters & UI state
        $options = [
            'statuses' => ['prospect', 'active', 'inactive', 'suspended'],
            'plan_statuses' => ['any', 'active', 'expired', 'none'],
            'financial_statuses' => [
                ['value' => '', 'label' => 'Any'],
                ['value' => 'true', 'label' => 'Has Debt'],
                ['value' => 'false', 'label' => 'No Debt'],
            ],
            'defaults' => [
                'deleted' => 'without',
                'per_page' => 100,
            ],
        ];

        // Permissions to toggle actions client-side
        $can = [
            'view' => $user?->can('members.view') === true,
            'manage' => $user?->can('members.manage') === true,
        ];

        // Endpoints used by the page (kept here for clarity/future refactor to Ziggy)
        $endpoints = [
            'index' => url('/web/api/admin/members'),
            'store' => url('/web/api/admin/members'),
            'show' => url('/web/api/admin/members/{id}'),
            'update' => url('/web/api/admin/members/{id}'),
            'destroy' => url('/web/api/admin/members/{id}'),
            'restore' => url('/web/api/admin/members/{id}/restore'),
            'status' => url('/web/api/admin/members/{id}/status'),
        ];

        return Inertia::render('Members/IndexNew', [
            'branches' => $branches,
            'options' => $options,
            'can' => $can,
            'endpoints' => $endpoints,
        ]);
    }

    public function show(string $memberId): Response
    {
        return Inertia::render('Members/ShowNew', [
            'memberId' => $memberId,
        ]);
    }
}
