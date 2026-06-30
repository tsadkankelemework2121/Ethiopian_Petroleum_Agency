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

    public function getVehicles(): JsonResponse
    {
        Log::info('ZTrackController::getVehicles called but bypassed (ZTrack vehicle list fetching is disabled).');
        return response()->json([
            'auth' => true,
            'success' => true,
            'msg' => 'Vehicle list fetched successfully (bypassed)',
            'data' => []
        ]);
    }

    /**
     * Get real-time status details of all vehicles in the ZTrack system.
     *
     * @return JsonResponse
     */
    public function getVehiclesStatus(): JsonResponse
    {
        // Extend PHP execution limit for this request (ZTrack can take >30s for large fleet)
        @set_time_limit(120);
        @ini_set('max_execution_time', 120);

        try {
            $data = $this->ztrack->getVehicleStatus();

            // The ZTrack API returns 'data' as an object keyed by unitId,
            // e.g. {"2962": {"unitId":2962, "name":"...", "lon":42.6}, ...}
            // The frontend expects an array with 'plateNo' and 'lng' fields.
            $vehicles = $data['data'] ?? [];
            if (is_object($vehicles) || (is_array($vehicles) && !array_is_list($vehicles))) {
                $vehicles = array_values((array) $vehicles);
            }

            // Map ZTrack field names to the frontend-expected names
            $normalized = array_map(function ($v) {
                return [
                    'unitId'   => $v['unitId'] ?? 0,
                    'plateNo'  => $v['name'] ?? $v['plateNo'] ?? 'Unknown',
                    'imei'     => 'ztrack_' . ($v['unitId'] ?? 0),
                    'lat'      => $v['lat'] ?? 0,
                    'lng'      => $v['lon'] ?? $v['lng'] ?? 0,
                    'speed'    => $v['speed'] ?? 0,
                    'engine'   => ($v['speed'] ?? 0) > 0 ? 'on' : 'off',
                    'status'   => ($v['speed'] ?? 0) > 0 ? 'Moving' : (isset($v['time']) && (time() - ($v['time'] ?? 0)) < 3600 ? 'Idle' : 'Stopped'),
                    'dt_tracker' => isset($v['time']) ? date('Y-m-d H:i:s', $v['time']) : now()->format('Y-m-d H:i:s'),
                    'dt_server'  => now()->format('Y-m-d H:i:s'),
                    'odometer'   => $v['odometer'] ?? 0,
                    'angle'      => $v['angle'] ?? 0,
                    'altitude'   => $v['altitude'] ?? 0,
                    'fuel_1'     => $v['fuel_1'] ?? '0 L',
                    'fuel_2'     => $v['fuel_2'] ?? '0 L',
                    'fuel_can_level_percent' => $v['fuel_can_level_percent'] ?? null,
                    'fuel_can_level_value'   => $v['fuel_can_level_value'] ?? null,
                    'custom_fields' => $v['custom_fields'] ?? 'ZTrack Vehicle',
                ];
            }, $vehicles);

            Log::info('ZTrack getVehiclesStatus: Returning ' . count($normalized) . ' vehicles with real data.');

            return response()->json([
                'auth'    => true,
                'success' => true,
                'msg'     => 'Vehicle status fetched successfully',
                'data'    => $normalized,
            ]);

        } catch (\Exception $e) {
            Log::error('ZTrack API getVehicleStatus failed:', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'auth' => false,
                'success' => false,
                'message' => 'ZTrack is currently unavailable: ' . $e->getMessage()
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
        // Extend PHP execution limit for this request
        @set_time_limit(120);
        @ini_set('max_execution_time', 120);

        $stInput = $request->input('st');
        $edInput = $request->input('ed');

        // Parse dates robustly using Carbon
        try {
            $st = $stInput ? \Illuminate\Support\Carbon::parse($stInput)->format('Y-m-d H:i:s') : \Illuminate\Support\Carbon::today()->startOfDay()->format('Y-m-d H:i:s');
            $ed = $edInput ? \Illuminate\Support\Carbon::parse($edInput)->format('Y-m-d H:i:s') : \Illuminate\Support\Carbon::today()->endOfDay()->format('Y-m-d H:i:s');
        } catch (\Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date format provided for st or ed query parameters. Please use Y-m-d H:i:s or ISO-8601.'
            ], 422);
        }

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
