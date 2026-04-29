<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use App\Models\DeliveryConfirmation;
use Illuminate\Http\Request;

class DispatchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = strtoupper($user->role);

        if ($role === 'DEPOT_ADMIN') {
            // Depot admin only sees dispatches targeting their depot
            $dispatches = Dispatch::where('destination_depot_id', $user->depot_id)
                ->with(['depot', 'confirmation.confirmedByUser'])
                ->get();
        } elseif ($role === 'OIL_COMPANY_ADMIN' || $role === 'OIL_COMPANY') {
            $dispatches = Dispatch::where('oil_company_id', $user->company_id)
                ->with(['depot', 'confirmation.confirmedByUser'])
                ->get();
        } else {
            $companyId = $request->query('oil_company_id');
            if ($companyId) {
                $dispatches = Dispatch::where('oil_company_id', $companyId)
                    ->with(['depot', 'confirmation.confirmedByUser'])
                    ->get();
            } else {
                $dispatches = Dispatch::with(['depot', 'confirmation.confirmedByUser'])->get();
            }
        }
        
        return response()->json($dispatches);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'oil_company_id' => 'required|string',
            'transporter_id' => 'nullable|string',
            'vehicle_id' => 'required|string',
            'dispatch_datetime' => 'required|date',
            'dispatch_location' => 'required|string',
            'destination_depot_id' => 'required|exists:depots,id',
            'eta_datetime' => 'required|date',
            'drop_off_datetime' => 'nullable|date',
            'fuel_type' => 'required|string',
            'dispatched_liters' => 'required|numeric',
        ]);

        // Auto-generate Dispatch No: PEA-YYYY-0001
        $year = date('Y');
        $lastDispatch = Dispatch::where('pea_dispatch_no', 'like', "PEA-$year-%")
            ->orderBy('pea_dispatch_no', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastDispatch) {
            $parts = explode('-', $lastDispatch->pea_dispatch_no);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        $validated['pea_dispatch_no'] = 'PEA-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        $dispatch = Dispatch::create($validated);
        return response()->json($dispatch->load(['depot', 'confirmation']), 201);
    }

    public function markAsDelivered(Request $request, Dispatch $dispatch)
    {
        $user = $request->user();
        $role = strtoupper($user->role);

        // DEPOT_ADMIN can only confirm dispatches targeting their depot
        if ($role === 'DEPOT_ADMIN') {
            if ($dispatch->destination_depot_id != $user->depot_id) {
                return response()->json(['message' => 'Forbidden: This dispatch is not for your depot'], 403);
            }
        } elseif ($role === 'OIL_COMPANY' || $role === 'OIL_COMPANY_ADMIN') {
            if ($dispatch->oil_company_id !== $user->company_id) {
                return response()->json(['message' => 'Forbidden: This dispatch belongs to another company'], 403);
            }
        } elseif ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validate image upload and location data
        $request->validate([
            'image' => 'required|image|max:10240', // max 10MB
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'vehicle_status' => 'nullable|string',
        ]);

        // Store the image
        $imagePath = $request->file('image')->store('confirmations', 'public');

        // Create delivery confirmation record
        $confirmation = DeliveryConfirmation::create([
            'dispatch_id' => $dispatch->id,
            'depot_id' => $role === 'DEPOT_ADMIN' ? $user->depot_id : $dispatch->destination_depot_id,
            'confirmed_by' => $user->id,
            'image_path' => $imagePath,
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'vehicle_status' => $request->input('vehicle_status'),
            'confirmed_at' => now(),
        ]);

        // Update dispatch status
        $dispatch->update([
            'status' => 'Delivered',
            'drop_off_datetime' => now(),
        ]);

        return response()->json($dispatch->load(['depot', 'confirmation.confirmedByUser']));
    }

    public function show(Dispatch $dispatch)
    {
        return response()->json($dispatch->load(['depot', 'confirmation.confirmedByUser']));
    }

    public function update(Request $request, Dispatch $dispatch)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'oil_company_id' => 'required|string',
            'transporter_id' => 'nullable|string',
            'vehicle_id' => 'required|string',
            'dispatch_datetime' => 'required|date',
            'dispatch_location' => 'required|string',
            'destination_depot_id' => 'required|exists:depots,id',
            'eta_datetime' => 'required|date',
            'drop_off_datetime' => 'nullable|date',
            'fuel_type' => 'required|string',
            'dispatched_liters' => 'required|numeric',
            'status' => 'nullable|string',
        ]);

        $dispatch->update($validated);
        return response()->json($dispatch->load(['depot', 'confirmation']));
    }

    // No destroy method - dispatches cannot be deleted
}
