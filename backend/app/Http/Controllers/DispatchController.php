<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use App\Models\OilCompany;
use App\Models\Transporter;
use App\Models\Vehicle;
use App\Models\Depot;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DispatchController extends Controller
{
    // Get all dispatches
    public function index(): JsonResponse
    {
        $dispatches = Dispatch::with(['oilCompany', 'transporter', 'vehicle', 'depot'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($dispatches);
    }

    // Get single dispatch by ID
    public function show($id): JsonResponse
    {
        $dispatch = Dispatch::with(['oilCompany', 'transporter', 'vehicle', 'depot'])
            ->findOrFail($id);

        return response()->json($dispatch);
    }

    // Get dispatch by PEA dispatch number
    public function getByPeaNo($peaDispatchNo): JsonResponse
    {
        $dispatch = Dispatch::with(['oilCompany', 'transporter', 'vehicle', 'depot'])
            ->where('pea_dispatch_no', $peaDispatchNo)
            ->firstOrFail();

        return response()->json($dispatch);
    }

    // Get dispatches by oil company
    public function getByOilCompany($oilCompanyId): JsonResponse
    {
        $dispatches = Dispatch::with(['oilCompany', 'transporter', 'vehicle', 'depot'])
            ->where('oil_company_id', $oilCompanyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($dispatches);
    }

    // Get dispatches by status
    public function getByStatus($status): JsonResponse
    {
        $dispatches = Dispatch::with(['oilCompany', 'transporter', 'vehicle', 'depot'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($dispatches);
    }

    // Create new dispatch
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pea_dispatch_no' => 'required|string|unique:dispatches',
            'oil_company_id' => 'required|exists:oil_companies,id',
            'transporter_id' => 'required|exists:transporters,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'destination_depot_id' => 'required|exists:depots,id',
            'dispatch_date_time' => 'required|date',
            'dispatch_location' => 'required|string',
            'eta_date_time' => 'required|date',
            'fuel_type' => 'required|string',
            'dispatched_liters' => 'required|integer',
            'status' => 'required|string',
        ]);

        $dispatch = Dispatch::create($validated);

        return response()->json($dispatch, 201);
    }

    // Update dispatch
    public function update(Request $request, $id): JsonResponse
    {
        $dispatch = Dispatch::findOrFail($id);

        $validated = $request->validate([
            'drop_off_date_time' => 'nullable|date',
            'drop_off_location' => 'nullable|string',
            'status' => 'sometimes|string',
            'last_gps_lat' => 'nullable|numeric',
            'last_gps_lng' => 'nullable|numeric',
            'last_gps_timestamp' => 'nullable|date',
        ]);

        $dispatch->update($validated);

        return response()->json($dispatch);
    }

    // Update GPS location
    public function updateGpsLocation(Request $request, $id): JsonResponse
    {
        $dispatch = Dispatch::findOrFail($id);

        $validated = $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'timestamp' => 'required|date',
        ]);

        $dispatch->update([
            'last_gps_lat' => $validated['lat'],
            'last_gps_lng' => $validated['lng'],
            'last_gps_timestamp' => $validated['timestamp'],
        ]);

        return response()->json($dispatch);
    }

    // Delete dispatch
    public function destroy($id): JsonResponse
    {
        $dispatch = Dispatch::findOrFail($id);
        $dispatch->delete();

        return response()->json(['message' => 'Dispatch deleted']);
    }

    // Get all oil companies
    public function getOilCompanies(): JsonResponse
    {
        $companies = OilCompany::all();
        return response()->json($companies);
    }

    // Get all transporters
    public function getTransporters(): JsonResponse
    {
        $transporters = Transporter::with('vehicles')->get();
        return response()->json($transporters);
    }

    // Get vehicles by transporter
    public function getVehiclesByTransporter($transporterId): JsonResponse
    {
        $vehicles = Vehicle::where('transporter_id', $transporterId)->get();
        return response()->json($vehicles);
    }

    // Get all depots
    public function getDepots(): JsonResponse
    {
        $depots = Depot::all();
        return response()->json($depots);
    }
}
