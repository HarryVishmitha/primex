<?php

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
});


Route::middleware('auth:sanctum')->get('/check-auth', function (Request $request) {
    return ['ok' => true, 'user' => $request->user()->email];
});
