<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ZTrack\ZTrackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Clear ZTrack cached SID on login to force fresh session ID
        try {
            app(ZTrackService::class)->clearCachedSid();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to clear cached ZTrack SID on login: ' . $e->getMessage());
        }

        // Create a new token (keep existing sessions alive for multi-device support)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'depot_id' => $user->depot_id,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'company_id' => $user->company_id,
            'depot_id' => $user->depot_id,
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke only the current token (not all devices)
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
