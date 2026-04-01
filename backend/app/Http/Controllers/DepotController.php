<?php

namespace App\Http\Controllers;

use App\Models\Depot;
use Illuminate\Http\Request;

class DepotController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role === 'OIL_COMPANY_ADMIN' || $role === 'OIL_COMPANY') {
            $depots = Depot::where('oil_company_id', $user->company_id)->get();
        } else {
            // EPA can see all, or filter if provided
            $companyId = $request->query('oil_company_id');
            if ($companyId) {
                $depots = Depot::where('oil_company_id', $companyId)->get();
            } else {
                $depots = Depot::all();
            }
        }
        
        return response()->json($depots);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'region' => 'required|string',
            'city' => 'required|string',
            'address' => 'required|string',
            'person1' => 'nullable|string',
            'person2' => 'nullable|string',
            'phone1' => 'nullable|string',
            'phone2' => 'nullable|string',
            'email1' => 'nullable|email',
            'email2' => 'nullable|email',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'map_link' => 'nullable|string',
            'oil_company_id' => 'required|string',
        ]);

        $depot = Depot::create($validated);
        return response()->json($depot, 201);
    }

    public function show(Depot $depot)
    {
        return response()->json($depot);
    }

    public function update(Request $request, Depot $depot)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // ... rest of update logic if needed
    }

    public function destroy(Request $request, Depot $depot)
    {
        $user = $request->user();
        $role = strtoupper($user->role);
        if ($role !== 'EPA_ADMIN' && $role !== 'SUPER_ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $depot->delete();
        return response()->json(null, 204);
    }
}
