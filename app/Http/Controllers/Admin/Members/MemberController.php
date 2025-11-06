<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Members;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Member\ChangeMemberStatusRequest;
use App\Http\Requests\Admin\Member\MemberIndexRequest;
use App\Http\Requests\Admin\Member\StoreMemberRequest;
use App\Http\Requests\Admin\Member\UpdateMemberRequest;
use App\Http\Requests\Admin\Member\UploadMemberPhotoRequest;
use App\Http\Resources\Admin\MemberResource;
use App\Models\Member;
use App\Models\User;
use App\Scopes\BranchScope;
use App\Services\MemberCodeService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class MemberController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly MemberCodeService $memberCodeService,
    ) {
    }

    public function index(MemberIndexRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Member::class);

        $tenantId = $request->tenantId();
        $filters = $request->validated();
        $user = $request->user();

        $query = $this->baseQuery($tenantId);
        $this->applyFilters($query, $filters, $user);

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $perPage = (int) ($filters['per_page'] ?? 25);
        $perPage = max(1, min(100, $perPage));

        $query->orderBy($sort, $direction);

        if ($request->boolean('debug')) {
            Log::debug('members.index', [
                'tenant_id' => $tenantId,
                'user_id' => $user?->id,
                'filters' => $filters,
            ]);
        }

        $debugQuery = $request->boolean('debug') ? clone $query : null;
        $members = $query->paginate($perPage)->withQueryString();

        $debug = $request->boolean('debug')
            ? $this->debugPayload($debugQuery, $filters, $members->total(), $tenantId)
            : null;

        $resource = MemberResource::collection($members);
        $filtersMeta = $this->filtersMeta($filters, $perPage, $sort, $direction);

        if ($request->boolean('raw')) {
            $data = $resource->resolve();

            $response = [
                'data' => $data,
                'meta' => $this->metaFromPaginator($members),
                'filters' => $filtersMeta,
            ];

            if ($debug !== null) {
                $response['debug'] = $debug;
            }

            return response()->json($response);
        }

        $additional = [
            'filters' => $filtersMeta,
        ];

        if ($debug !== null) {
            $additional['debug'] = $debug;
        }

        return $resource
            ->additional($additional)
            ->response();
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $this->authorize('create', Member::class);

        $data = $request->validated();
        $tenantId = $request->tenantId();

        $data['tenant_id'] = $tenantId;

        if (empty($data['status'])) {
            $data['status'] = 'prospect';
        }

        if (empty($data['code'])) {
            $data['code'] = $this->memberCodeService->next($tenantId);
        }

        $member = Member::query()
            ->withoutGlobalScope(BranchScope::class)
            ->create($data);

        $member->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
        ]);

        $member->setAttribute('balance_due_cents', 0);

        return MemberResource::make($member)
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, string $member): MemberResource|JsonResponse
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: $request->boolean('with_deleted'));

        $this->authorize('view', $memberModel);

        $memberModel->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
            'subscriptions' => fn($query) => $query->with('plan:id,name')->latest('ends_at')->limit(10),
            'payments' => fn($query) => $query->latest('paid_at')->limit(10),
            'invoices' => fn($query) => $query->latest('issued_at')->limit(10),
            'attendanceLogs' => fn($query) => $query->latest('checked_in_at')->limit(20),
        ]);

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $memberModel->loadCount([
            'attendanceLogs as attendance_count' => fn(Builder $builder) => $builder->whereBetween(
                'checked_in_at',
                [$startOfMonth, $endOfMonth]
            ),
        ]);

        $invoiceTotal = (int) $memberModel->invoices()->sum('total_cents');
        $successfulPayments = $memberModel->payments()->where('status', 'succeeded');
        $paymentTotal = (int) (clone $successfulPayments)->sum('amount_cents');
        $lastPaymentAt = (clone $successfulPayments)->max('paid_at');
        $nextExpiryAt = $memberModel->subscriptions()
            ->whereIn('status', ['active', 'pending'])
            ->max('ends_at');

        $memberModel->setAttribute('invoices_total_cents', $invoiceTotal);
        $memberModel->setAttribute('payments_total_cents', $paymentTotal);
        $memberModel->setAttribute('last_payment_at', $lastPaymentAt);
        $memberModel->setAttribute('next_expiry_at', $nextExpiryAt);
        $memberModel->setAttribute('balance_due_cents', $invoiceTotal - $paymentTotal);

        if ($request->boolean('raw')) {
            $m = $memberModel;
            $data = [
                'id' => (string) $m->id,
                'tenant_id' => (string) $m->tenant_id,
                'code' => $m->code,
                'full_name' => $m->full_name,
                'gender' => $m->gender,
                'dob' => $m->dob?->toDateString(),
                'phone' => $m->phone,
                'email' => $m->email,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'branch' => $m->branch ? [ 'id' => (string) $m->branch->id, 'name' => $m->branch->name ] : null,
                'user_id' => $m->user_id ? (string) $m->user_id : null,
                'emergency_contact' => $m->emergency_contact,
                'next_expiry_at' => $m->next_expiry_at?->toIso8601String(),
                'last_payment_at' => $m->last_payment_at?->toIso8601String(),
                'balance_due_cents' => (int) $m->balance_due_cents,
                'avatar_url' => null,
                'deleted_at' => $m->deleted_at?->toIso8601String(),
                'created_at' => $m->created_at?->toIso8601String(),
                'updated_at' => $m->updated_at?->toIso8601String(),
                'attendance_count' => (int) ($m->attendance_count ?? 0),
                'latest_subscription' => $m->latestSubscription ? [
                    'id' => (string) $m->latestSubscription->id,
                    'status' => $m->latestSubscription->status,
                    'starts_at' => $m->latestSubscription->starts_at?->toIso8601String(),
                    'ends_at' => $m->latestSubscription->ends_at?->toIso8601String(),
                    'auto_renew' => (bool) $m->latestSubscription->auto_renew,
                    'plan' => $m->latestSubscription->plan ? [ 'id' => (string) $m->latestSubscription->plan->id, 'name' => $m->latestSubscription->plan->name ] : null,
                ] : null,
                'subscriptions' => $m->subscriptions?->map(function ($s) {
                    return [
                        'id' => (string) $s->id,
                        'status' => $s->status,
                        'starts_at' => $s->starts_at?->toIso8601String(),
                        'ends_at' => $s->ends_at?->toIso8601String(),
                        'auto_renew' => (bool) $s->auto_renew,
                        'plan' => $s->plan ? [ 'id' => (string) $s->plan->id, 'name' => $s->plan->name ] : null,
                    ];
                })->all(),
                'payments' => $m->payments?->map(function ($p) {
                    return [
                        'id' => (string) $p->id,
                        'invoice_id' => $p->invoice_id ? (string) $p->invoice_id : null,
                        'status' => $p->status,
                        'method' => $p->method,
                        'amount_cents' => $p->amount_cents?->toInteger() ?? 0,
                        'paid_at' => $p->paid_at?->toIso8601String(),
                    ];
                })->all(),
                'invoices' => $m->invoices?->map(function ($i) {
                    return [
                        'id' => (string) $i->id,
                        'number' => $i->number,
                        'status' => $i->status,
                        'total_cents' => $i->total_cents?->toInteger() ?? 0,
                        'issued_at' => $i->issued_at?->toIso8601String(),
                        'due_at' => $i->due_at?->toIso8601String(),
                    ];
                })->all(),
                'attendance_logs' => $m->attendanceLogs?->map(function ($a) {
                    return [
                        'id' => (string) $a->id,
                        'checked_in_at' => $a->checked_in_at?->toIso8601String(),
                        'checked_out_at' => $a->checked_out_at?->toIso8601String(),
                        'source' => $a->source,
                    ];
                })->all(),
            ];

            return response()->json(['data' => $data]);
        }

        return MemberResource::make($memberModel);
    }

    public function update(UpdateMemberRequest $request, string $member): MemberResource
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('update', $memberModel);

        $memberModel->fill($request->validated());
        $memberModel->save();

        $memberModel->refresh()->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
        ]);

        return MemberResource::make($memberModel);
    }

    public function destroy(Request $request, string $member): Response
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('delete', $memberModel);

        if (! $memberModel->trashed()) {
            $memberModel->delete();
        }

        return response()->noContent();
    }

    public function restore(Request $request, string $member): MemberResource
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('delete', $memberModel);

        if ($memberModel->trashed()) {
            $memberModel->restore();
        }

        $memberModel->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
        ]);

        return MemberResource::make($memberModel);
    }

    public function uploadPhoto(UploadMemberPhotoRequest $request, string $member): JsonResponse
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('update', $memberModel);

        $memberModel->clearMediaCollection('avatar');
        $media = $memberModel->addMediaFromRequest('photo')->toMediaCollection('avatar');

        if ($media !== null && app()->bound('tenancy') && tenancy()->initialized) {
            $media->tenant_id = tenant()->getTenantKey();
            $media->save();
        }

        return response()->json([
            'avatar_url' => $memberModel->getFirstMediaUrl('avatar'),
        ]);
    }

    public function updateStatus(ChangeMemberStatusRequest $request, string $member): MemberResource
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('update', $memberModel);

        $memberModel->forceFill(['status' => $request->validated('status')])->save();

        $memberModel->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
        ]);

        return MemberResource::make($memberModel);
    }

    public function renew(Request $request, string $member): MemberResource|JsonResponse
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('update', $memberModel);

        $planId = $request->input('plan_id');
        $autoRenew = (bool) $request->boolean('auto_renew');

        $plan = null;
        if ($planId) {
            $plan = \App\Models\Plan::query()
                ->where('tenant_id', $memberModel->tenant_id)
                ->find($planId);
        } elseif ($memberModel->latestSubscription?->plan) {
            $plan = $memberModel->latestSubscription->plan;
        }

        if ($plan === null) {
            return response()->json([
                'message' => 'A plan is required to renew the subscription.',
                'errors' => ['plan_id' => ['The plan field is required.']],
            ], 422);
        }

        try {
            $activate = app(\App\Domain\Subscriptions\ActivateSubscription::class);
            $activate($memberModel, $plan, $autoRenew);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $memberModel->load([
            'branch:id,name',
            'latestSubscription.plan:id,name',
        ]);

        return MemberResource::make($memberModel);
    }

    public function message(Request $request, string $member): JsonResponse
    {
        $memberModel = $this->findMemberOrFail($request, $member, includeTrashed: true);

        $this->authorize('update', $memberModel);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
        ]);

        if (! $memberModel->user_id) {
            return response()->json([
                'message' => 'This member is not linked to a user.',
            ], 422);
        }

        \App\Models\Notification::create([
            'tenant_id' => $memberModel->tenant_id,
            'user_id' => $memberModel->user_id,
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);

        return response()->json(['message' => 'Message queued for delivery.']);
    }

    private function baseQuery(string $tenantId): Builder
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return Member::query()
            ->withoutGlobalScope(BranchScope::class)
            ->forTenant($tenantId)
            ->select('members.*')
            ->with([
                'branch:id,name',
                'latestSubscription' => fn($query) => $query->with('plan:id,name'),
            ])
            ->withCount([
                'attendanceLogs as attendance_count' => fn(Builder $builder) => $builder->whereBetween(
                    'checked_in_at',
                    [$startOfMonth, $endOfMonth]
                ),
            ])
            ->selectRaw(
                '(SELECT COALESCE(SUM(total_cents), 0) FROM invoices WHERE invoices.member_id = members.id AND invoices.tenant_id = ?) - ' .
                '(SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE payments.member_id = members.id AND payments.tenant_id = ? AND payments.status = "succeeded") AS balance_due_cents',
                [$tenantId, $tenantId]
            )
            ->selectRaw(
                '(SELECT MAX(paid_at) FROM payments WHERE payments.member_id = members.id AND payments.tenant_id = ? AND payments.status = "succeeded") AS last_payment_at',
                [$tenantId]
            )
            ->selectRaw(
                '(SELECT ends_at FROM subscriptions WHERE subscriptions.member_id = members.id AND subscriptions.tenant_id = ? AND subscriptions.status IN ("active","pending") ORDER BY ends_at DESC LIMIT 1) AS next_expiry_at',
                [$tenantId]
            )
            ->selectRaw(
                '(SELECT status FROM subscriptions WHERE subscriptions.member_id = members.id AND subscriptions.tenant_id = ? ORDER BY ends_at DESC LIMIT 1) AS latest_subscription_status',
                [$tenantId]
            )
            ->selectRaw(
                '(SELECT ends_at FROM subscriptions WHERE subscriptions.member_id = members.id AND subscriptions.tenant_id = ? ORDER BY ends_at DESC LIMIT 1) AS latest_subscription_ends_at',
                [$tenantId]
            );
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters(Builder $query, array $filters, ?User $user): void
    {
        if (! empty($filters['status'])) {
            $query->whereIn('status', (array) $filters['status']);
        }

        if (! empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (! empty($filters['q'])) {
            $query->search($filters['q']);
        }

        $deleted = $filters['deleted'] ?? 'without';
        if ($deleted === 'with') {
            $query->withTrashed();
        } elseif ($deleted === 'only') {
            $query->onlyTrashed();
        }

        if (($filters['plan_status'] ?? null) !== null) {
            $now = Carbon::now();
            switch ($filters['plan_status']) {
                case 'active':
                    $query->havingRaw(
                        '(latest_subscription_status IN ("active","pending")) AND (latest_subscription_ends_at IS NULL OR latest_subscription_ends_at >= ?)',
                        [$now]
                    );
                    break;
                case 'expired':
                    $query->havingRaw(
                        '(latest_subscription_status IS NOT NULL AND (latest_subscription_status IN ("expired","cancelled") OR latest_subscription_ends_at < ?))',
                        [$now]
                    );
                    break;
                case 'none':
                    $query->havingRaw('latest_subscription_status IS NULL');
                    break;
            }
        }

        if (array_key_exists('has_debt', $filters) && $filters['has_debt'] !== null) {
            $filters['has_debt']
                ? $query->having('balance_due_cents', '>', 0)
                : $query->having('balance_due_cents', '<=', 0);
        }

        if (
            $user !== null
            && ! $user->hasAnyRole(['Owner', 'Manager'])
            && $user->branch_id !== null
            && empty($filters['branch_id'])
        ) {
            $query->where('branch_id', $user->branch_id);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    private function filtersMeta(array $filters, int $perPage, string $sort, string $direction): array
    {
        return [
            'status' => $filters['status'] ?? [],
            'branch_id' => $filters['branch_id'] ?? null,
            'plan_status' => $filters['plan_status'] ?? null,
            'has_debt' => $filters['has_debt'] ?? null,
            'q' => $filters['q'] ?? null,
            'deleted' => $filters['deleted'] ?? 'without',
            'sort' => $sort,
            'direction' => $direction,
            'per_page' => $perPage,
        ];
    }

    private function metaFromPaginator(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    private function debugPayload(?Builder $query, array $filters, int $total, string $tenantId): array
    {
        if ($query === null) {
            return [];
        }

        return [
            'tenant_id' => $tenantId,
            'filters' => $filters,
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
            'total' => $total,
        ];
    }

    private function findMemberOrFail(Request $request, string $memberId, bool $includeTrashed = false): Member
    {
        $tenantId = $this->tenantId($request);

        $query = Member::query()
            ->withoutGlobalScope(BranchScope::class)
            ->forTenant($tenantId);

        if ($includeTrashed) {
            $query->withTrashed();
        }

        $member = $query->find($memberId);

        if ($member === null) {
            throw (new ModelNotFoundException())
                ->setModel(Member::class, [$memberId]);
        }

        if ($member->tenant_id !== $tenantId) {
            abort(404);
        }

        return $member;
    }

    private function tenantId(Request $request): string
    {
        if (app()->bound('tenancy') && tenancy()->initialized) {
            return tenant()->getTenantKey();
        }

        $tenantId = $request->user()?->tenant_id;

        if (! $tenantId) {
            abort(403, 'Tenant context missing for request.');
        }

        return $tenantId;
    }
}
