<?php

use App\Http\Controllers\Admin\Members\MemberController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the framework and are assigned the "api"
| middleware group. You can protect routes with Sanctum by using the
| "auth:sanctum" middleware. Cookie-based SPA auth and personal access
| tokens are both supported.
|
*/

Route::get('/ping', fn () => response()->json(['ok' => true]));

Route::middleware('auth:sanctum')->group(function () {
    // Authenticated health check (separate path to avoid clashing with public /api/ping)
    Route::get('/ping-auth', fn () => response()->json(['ok' => true, 'auth' => true]));
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('admin/members')->name('admin.members.')->group(function () {
        Route::get('/', [MemberController::class, 'index'])->name('index');
        Route::post('/', [MemberController::class, 'store'])->name('store');
        Route::get('/{member}', [MemberController::class, 'show'])->name('show');
        Route::put('/{member}', [MemberController::class, 'update'])->name('update');
        Route::delete('/{member}', [MemberController::class, 'destroy'])->name('destroy');
        Route::post('/{member}/restore', [MemberController::class, 'restore'])->name('restore');
        Route::post('/{member}/photo', [MemberController::class, 'uploadPhoto'])->name('photo');
        Route::post('/{member}/status', [MemberController::class, 'updateStatus'])->name('status');
    });

    // Debug route to check permissions
    Route::get('/debug/permissions', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tenant_id' => $user->tenant_id,
            ],
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'roles' => $user->getRoleNames(),
            'has_members_view' => $user->can('members.view'),
            'has_members_manage' => $user->can('members.manage'),
        ]);
    });

    
});


Route::middleware('auth:sanctum')->get('/check-auth', function (Request $request) {
    return ['ok' => true, 'user' => $request->user()->email];
});
