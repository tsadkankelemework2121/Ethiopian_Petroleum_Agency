<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use Illuminate\Http\Request;

class DispatchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'OIL_COMPANY_ADMIN' || $user->role === 'OIL_COMPANY') {
            $dispatches = Dispatch::where('oil_company_id', $user->companyId)->with('depot')->get();
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
        if ($user->role !== 'EPA_ADMIN' && $user->role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'pea_dispatch_no' => 'required|string|unique:dispatches,pea_dispatch_no',
            'oil_company_id' => 'required|string',
            'transporter_id' => 'required|string',
            'vehicle_id' => 'required|string',
            'dispatch_datetime' => 'required|date',
            'dispatch_location' => 'required|string',
            'destination_depot_id' => 'required|exists:depots,id',
            'eta_datetime' => 'required|date',
            'drop_off_datetime' => 'nullable|date',
            'fuel_type' => 'required|string',
            'dispatched_liters' => 'required|numeric',
        ]);

        $dispatch = Dispatch::create($validated);
        return response()->json($dispatch, 201);
    }

    public function show(Dispatch $dispatch)
    {
        return response()->json($dispatch->load('depot'));
    }

    public function update(Request $request, Dispatch $dispatch)
    {
        //
    }

    public function destroy(Dispatch $dispatch)
    {
        //
    }
}
