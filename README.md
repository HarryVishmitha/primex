# Primex Tenant Platform

Primex is a multi-tenant fitness platform built on Laravel 12, Stancl Tenancy, and Spatie's RBAC stack. Each tenant operates in a single shared database with strict `tenant_id` scoping and optional `branch_id` partitioning for branch-aware entities.

## Schema Overview

The domain is organised around the following modules. Every table uses ULID primary keys, carries a `tenant_id`, and applies the hot-path indexes described in the architecture brief.

- **Identity & Access**: `tenants`, `branches`, `users`, and Spatie permission tables in teams mode (`tenant_id` = team key).
- **Members & Memberships**: `members`, `plans`, `subscriptions`, `attendance_logs` with transactional guard requirements (single active sub, no double check-ins).
- **Finance**: `invoices`, `invoice_items`, `payments`, `refunds` (append-only, restricted deletes, activity logged through observers/events).
- **Classes & Bookings**: `class_categories`, `classes`, `class_schedules`, `class_bookings`, `class_waitlists` with trainer assignments.
- **Workouts & Progress**: `exercises`, `programs`, `member_programs`, `workout_sessions`, `workout_sets`, `body_measurements`.
- **Nutrition**: `meal_plan_templates`, `meal_template_days`, `meals`, `member_meal_plans`.
- **POS & Inventory**: `product_categories`, `products`, `product_stocks`, `stock_movements`, `pos_sales`, `pos_sale_items`.
- **Communication & Support**: `announcements`, `notifications`, `tickets`, `ticket_messages`.
- **Shared**: `devices`, `settings` (JSON payload per tenant), Spatie activity log/media tables.

Global tenant and branch scopes, a money value object with casting, domain observers, and policy stubs are all registered and ready for application services.

## Seed Data

Factories generate realistic data for every module. The seeders run in the required order:

1. `TenantSeeder` → bootstrap the primary tenant (`PRIMEX`).
2. `BranchSeeder` → create the tenant's branches.
3. `RolesAndPermissionsSeeder` → seed team-scoped roles (Owner, Manager, Trainer, Receptionist, Member) and permissions.
4. `StaffSeeder` → create staff users and attach the seeded roles.
5. `MemberSeeder` → create member records (including one linked member portal user).
6. `PlanSeeder` and `SubscriptionSeeder` → create plans and active subscriptions.
7. `InventorySeeder` → seed product categories, products, and branch stock levels.
8. `ClassSeeder` → build class categories, classes, and schedules with trainers.
9. `FinanceSeeder` → issue invoices, auto-compute items, and record succeeded payments.
10. `CommunicationSeeder` → publish announcements and default settings records.
11. Patch seeders: `FixInvoiceMath` and `FixJsonNulls` reconcile totals and JSON payloads after the feature seeders run.

## Local Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

> **Note:** The migrate/seed commands require an available MySQL connection. When running inside the Codex harness the connection may be unavailable; configure your `.env` before executing the commands locally.

## Tenancy & RBAC Notes

- Tenant and branch scopes are added through observers, guaranteeing `tenant_id`/`branch_id` assignment on create.
- Policies are registered in `AuthServiceProvider` and enforce tenant/branch isolation alongside Spatie permissions.
- Finance observers prevent destructive deletes on invoices, payments, and refunds while auto-calculating line totals.
- Domain events (`SubscriptionActivated`, `PaymentSucceeded`, `ClassBooked`) are dispatched for downstream workflows (notifications, automation, etc.).

The codebase is now ready for application services, UI flows, and integration tests on top of a production-grade schema.

## Phase 2 Schema Alignments

- Activity log, media library, Sanctum tokens, domains, settings, and ticket messages now store ULID foreign keys as `CHAR(26)` to stay aligned with tenant/member identifiers.
- Integrity checks guard invoice, invoice item, and payment monetary columns against negative values or zero quantities.
- Hot-path indexes cover subscriptions, attendance logs, payments, invoices, class bookings, and product SKUs. Existing anonymous SKU unique keys are re-created as `prod_tenant_sku_unique`.
- Migration `2025_11_05_100300_normalize_tenant_branch_fk` intentionally omits a `down()` body to avoid lossy reversals when re-lengthening columns.

## Domain Guards & Services

- `ActivateSubscription` enforces a single active subscription per member using row-level locking.
- `CheckInMember` prevents concurrent attendance sessions per member/tenant.
- `BookClass` blocks over-capacity reservations by counting `reserved` + `checked_in` bookings in a serialized transaction.
- Invoice item observers now account for line discounts (defaulting to zero) and clamp totals to non-negative values.

## Quality Gates

- Feature coverage is provided by Pest tests under `tests/Feature/*`:
  - Finance: invoice math reconciliation & tenant-scoped numbering.
  - Subscriptions: activation guard.
  - Attendance: double check-in prevention.
  - Classes: capacity enforcement.
  - Tenancy: tenant and branch scope isolation.
- Static analysis uses Larastan at max level (`phpstan.neon.dist`) and Laravel Pint (`vendor/bin/pint`).
- Run all checks with `composer run qa`, which executes database refresh + seeds, feature tests, Pint (dry-run), and PHPStan analysis.

## Operational Runbook

1. `php artisan migrate` (or `php artisan migrate:fresh --seed` for a rebuild).
2. `php artisan db:seed` (already calls the patch seeders listed above).
3. `php artisan test` (or `composer run qa` for the full gate).
4. `php artisan permission:cache-reset` whenever roles/permissions/teams are updated.

These steps keep schema, seed data, caches, and quality gates aligned for every deployment cycle.
