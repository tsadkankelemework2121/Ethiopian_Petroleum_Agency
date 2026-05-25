<?php

namespace App\Http\Controllers;

use App\Exceptions\ZTrackException;
use App\Services\ZTrack\ZTrackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZTrackController extends Controller
{
    /**
     * The ZTrack service instance.
     *
     * @var ZTrackService
     */
    protected $ztrack;

    /**
     * Create a new controller instance.
     *
     * @param ZTrackService $ztrack
     */
    public function __construct(ZTrackService $ztrack)
    {
        $this->ztrack = $ztrack;
    }

    /**
     * Get a list of all vehicles registered in the ZTrack system.
     *
     * @return JsonResponse
     */
    public function getVehicles(): JsonResponse
    {
        try {
            $data = $this->ztrack->getVehicleLists();
            return response()->json($data);
        } catch (ZTrackException $e) {
            Log::error('ZTrack API Error in getVehicles controller:', [
                'message' => $e->getMessage(),
                'payload' => $e->getResponsePayload()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'ZTrack API Error: ' . $e->getMessage()
            ], 502);
        }
    }

    /**
     * Get real-time status details of all vehicles in the ZTrack system.
     *
     * @return JsonResponse
     */
    public function getVehiclesStatus(): JsonResponse
    {
        try {
            $data = $this->ztrack->getVehicleStatus();
            return response()->json($data);
        } catch (ZTrackException $e) {
            Log::error('ZTrack API Error in getVehiclesStatus controller:', [
                'message' => $e->getMessage(),
                'payload' => $e->getResponsePayload()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'ZTrack API Error: ' . $e->getMessage()
            ], 502);
        }
    }

    /**
     * Get the movement report for a specific vehicle over a custom timeframe.
     *
     * @param Request $request
     * @param int|string $unitId Vehicle identifier
     * @return JsonResponse
     */
    public function getMovementReport(Request $request, $unitId): JsonResponse
    {
        $request->validate([
            'st' => 'required|date_format:Y-m-d H:i:s',
            'ed' => 'required|date_format:Y-m-d H:i:s',
        ], [
            'st.required' => 'The start date and time (st) is required.',
            'st.date_format' => 'The start date and time (st) must be in the format Y-m-d H:i:s.',
            'ed.required' => 'The end date and time (ed) is required.',
            'ed.date_format' => 'The end date and time (ed) must be in the format Y-m-d H:i:s.',
        ]);

        $st = $request->input('st');
        $ed = $request->input('ed');

        try {
            $data = $this->ztrack->getMovReport($unitId, $st, $ed);
            return response()->json($data);
        } catch (ZTrackException $e) {
            Log::error("ZTrack API Error in getMovementReport controller for unit {$unitId}:", [
                'message' => $e->getMessage(),
                'payload' => $e->getResponsePayload()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'ZTrack API Error: ' . $e->getMessage()
            ], 502);
        }
    }
}
