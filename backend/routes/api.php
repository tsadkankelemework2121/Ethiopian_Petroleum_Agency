<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepotController;
use App\Http\Controllers\DispatchController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('depots', DepotController::class);

    Route::post('/dispatches/{dispatch}/deliver', [DispatchController::class, 'markAsDelivered']);
    // Dispatches: only index, store, show, update (no destroy)
    Route::apiResource('dispatches', DispatchController::class)->except(['destroy']);
});
