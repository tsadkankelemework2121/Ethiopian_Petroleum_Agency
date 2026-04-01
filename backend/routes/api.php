<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('depots', App\Http\Controllers\DepotController::class);
    Route::post('/dispatches/{dispatch}/deliver', [App\Http\Controllers\DispatchController::class, 'markAsDelivered']);
    Route::apiResource('dispatches', App\Http\Controllers\DispatchController::class);
});
