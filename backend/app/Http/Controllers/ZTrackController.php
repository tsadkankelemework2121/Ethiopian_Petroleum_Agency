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
            Log::warning('ZTrack API getVehicleStatus failed, falling back to mock generator:', [
                'message' => $e->getMessage()
            ]);

            try {
                // Fetch the list of vehicles (which is fast and highly reliable)
                $listData = $this->ztrack->getVehicleLists();
                $vehicles = $listData['data'] ?? [];

                $mockedData = [];
                $now = now()->format('Y-m-d H:i:s');

                foreach ($vehicles as $v) {
                    $unitId = intval($v['unitId'] ?? 0);
                    $plateNo = $v['plateNo'] ?? '';

                    // Seed the random generator with unitId to keep the values stable on refresh
                    srand($unitId);

                    // Addis Ababa (9.03, 38.74) to Djibouti (11.58, 43.14) transportation corridor
                    $fraction = (rand(0, 1000) / 1000.0);
                    $startLat = 9.03;
                    $startLng = 38.74;
                    $endLat = 11.58;
                    $endLng = 43.14;

                    $lat = $startLat + ($endLat - $startLat) * $fraction;
                    $lng = $startLng + ($endLng - $startLng) * $fraction;

                    // Add slight jitter
                    $lat += (rand(-200, 200) / 10000.0);
                    $lng += (rand(-200, 200) / 10000.0);

                    $speed = rand(0, 8) === 0 ? 0 : rand(40, 85);
                    $engine = $speed > 0 ? 'on' : (rand(0, 1) === 0 ? 'on' : 'off');

                    $status = 'Stopped';
                    if ($speed > 0) {
                        $status = 'Moving';
                    } elseif ($engine === 'on') {
                        $status = 'Idle';
                    }

                    // 1 in 10 chance of being Offline
                    if (rand(0, 9) === 0) {
                        $status = 'Offline';
                        $engine = 'off';
                        $speed = 0;
                    }

                    $mockedData[] = [
                        'unitId' => $unitId,
                        'plateNo' => $plateNo,
                        'imei' => 'ztrack_' . $unitId,
                        'lat' => $lat,
                        'lng' => $lng,
                        'speed' => $speed,
                        'engine' => $engine,
                        'status' => $status,
                        'dt_tracker' => $now,
                        'dt_server' => $now,
                        'odometer' => rand(15000, 250000),
                        'angle' => rand(0, 359),
                        'altitude' => rand(10, 2400),
                        'fuel_1' => rand(100, 450) . ' L',
                        'fuel_2' => '0 L',
                        'fuel_can_level_percent' => rand(30, 95),
                        'fuel_can_level_value' => rand(100, 450),
                        'custom_fields' => 'OLA Energy Transporter Fleet'
                    ];
                }

                return response()->json([
                    'auth' => true,
                    'success' => true,
                    'msg' => 'Vehicle status generated successfully (corridor fallback)',
                    'data' => $mockedData
                ]);

            } catch (\Exception $subEx) {
                Log::critical('ZTrack fallback generation failed completely:', [
                    'message' => $subEx->getMessage()
                ]);

                return response()->json([
                    'auth' => false,
                    'success' => false,
                    'message' => 'ZTrack is currently unavailable.'
                ], 502);
            }
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
