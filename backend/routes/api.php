<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DispatchController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dispatch endpoints
    Route::get('/dispatches', [DispatchController::class, 'index']);
    Route::get('/dispatches/{id}', [DispatchController::class, 'show']);
    Route::get('/dispatches/pea/{peaDispatchNo}', [DispatchController::class, 'getByPeaNo']);
    Route::post('/dispatches', [DispatchController::class, 'store']);
    Route::put('/dispatches/{id}', [DispatchController::class, 'update']);
    Route::patch('/dispatches/{id}/gps', [DispatchController::class, 'updateGpsLocation']);
    Route::delete('/dispatches/{id}', [DispatchController::class, 'destroy']);
    Route::get('/dispatches/oil-company/{oilCompanyId}', [DispatchController::class, 'getByOilCompany']);
    Route::get('/dispatches/status/{status}', [DispatchController::class, 'getByStatus']);

    // Reference data endpoints (for dropdowns/selects)
    Route::get('/oil-companies', [DispatchController::class, 'getOilCompanies']);
    Route::get('/transporters', [DispatchController::class, 'getTransporters']);
    Route::get('/transporters/{transporterId}/vehicles', [DispatchController::class, 'getVehiclesByTransporter']);
    Route::get('/depots', [DispatchController::class, 'getDepots']);
});
