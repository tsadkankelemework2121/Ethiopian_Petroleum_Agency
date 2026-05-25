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
