<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use Illuminate\Http\Request;

class DispatchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role === 'OIL_COMPANY_ADMIN' || $role === 'OIL_COMPANY') {
            $dispatches = Dispatch::where('oil_company_id', $user->company_id)->with('depot')->get();
        } else {
            $companyId = $request->query('oil_company_id');
            if ($companyId) {
                $dispatches = Dispatch::where('oil_company_id', $companyId)->with('depot')->get();
            } else {
                $dispatches = Dispatch::with('depot')->get();
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
        return response()->json($dispatch, 201);
    }

    public function markAsDelivered(Request $request, Dispatch $dispatch)
    {
        $user = $request->user();
        $role = strtoupper($user->role);

        // Only the assigned Oil Company can mark as delivered
        if ($role === 'OIL_COMPANY' || $role === 'OIL_COMPANY_ADMIN') {
            if ($dispatch->oil_company_id !== $user->company_id) {
                return response()->json(['message' => 'Forbidden: This dispatch belongs to another company'], 403);
            }
        } elseif ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $dispatch->update(['status' => 'Delivered']);
        return response()->json($dispatch);
    }

    public function show(Dispatch $dispatch)
    {
        return response()->json($dispatch->load('depot'));
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
        return response()->json($dispatch);
    }

    public function destroy(Request $request, Dispatch $dispatch)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $dispatch->delete();
        return response()->json(null, 204);
    }
}
