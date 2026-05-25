<?php

namespace App\Console\Commands;

use App\Exceptions\ZTrackException;
use App\Services\ZTrack\ZTrackService;
use Illuminate\Console\Command;

class TestZTrack extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ztrack:test 
                            {--auth-only : Only run the authentication flow}
                            {--list-vehicles : Fetch and list vehicles}
                            {--status : Fetch and display real-time status}
                            {--report : Fetch movement report}
                            {--unitId= : The Unit ID of the car for movement report}
                            {--st= : Start date/time (Y-m-d H:i:s) for movement report}
                            {--ed= : End date/time (Y-m-d H:i:s) for movement report}
                            {--clear-cache : Clear cached SID before making requests}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify connectivity, authentication, and retrieve real data from ZTrack APIs';

    /**
     * Execute the console command.
     *
     * @param ZTrackService $ztrack
     * @return int
     */
    public function handle(ZTrackService $ztrack): int
    {
        $this->title('ZTrack External Integration Test Console');

        // Display basic configuration details
        $this->displayConfig();

        if ($this->option('clear-cache')) {
            $this->warn('Option --clear-cache specified. Clearing cached ZTrack SID...');
            $ztrack->clearCachedSid();
            $this->info('Cache cleared successfully!');
        }

        try {
            $this->info('Attempting to fetch active ZTrack Session ID (SID)...');
            $sid = $ztrack->getSid();
            $this->success("Authenticated successfully! SID: {$sid}");
        } catch (ZTrackException $e) {
            $this->error("Authentication Error: " . $e->getMessage());
            if ($e->getResponsePayload()) {
                $this->line('Response Payload:');
                $this->line(json_encode($e->getResponsePayload(), JSON_PRETTY_PRINT));
            }
            return 1;
        }

        if ($this->option('auth-only')) {
            $this->info('Only authentication requested. Stopping test.');
            return 0;
        }

        // Determine which actions to run. If none are specified, we run them in sequence.
        $runAll = !$this->option('list-vehicles') && !$this->option('status') && !$this->option('report');
        $runList = $this->option('list-vehicles') || $runAll;
        $runStatus = $this->option('status') || $runAll;
        $runReport = $this->option('report');

        $sampleUnitId = null;

        if ($runList) {
            $this->section('Testing: getVehicleLists');
            try {
                $response = $ztrack->getVehicleLists();
                $this->success('getVehicleLists fetched successfully!');
                $this->line(json_encode($response, JSON_PRETTY_PRINT));

                $vehicles = $response['data'] ?? [];
                if (!empty($vehicles) && is_array($vehicles)) {
                    $sampleUnitId = $vehicles[0]['unitId'] ?? null;
                    $this->info('Found ' . count($vehicles) . ' vehicle(s).');
                } else {
                    $this->warn('No vehicles found in list data.');
                }
            } catch (ZTrackException $e) {
                $this->error("getVehicleLists failed: " . $e->getMessage());
                if ($e->getResponsePayload()) {
                    $this->line(json_encode($e->getResponsePayload(), JSON_PRETTY_PRINT));
                }
            }
        }

        if ($runStatus) {
            $this->section('Testing: getVehicleStatus');
            try {
                $response = $ztrack->getVehicleStatus();
                $this->success('getVehicleStatus fetched successfully!');
                $this->line(json_encode($response, JSON_PRETTY_PRINT));
            } catch (ZTrackException $e) {
                $this->error("getVehicleStatus failed: " . $e->getMessage());
                if ($e->getResponsePayload()) {
                    $this->line(json_encode($e->getResponsePayload(), JSON_PRETTY_PRINT));
                }
            }
        }

        if ($runReport) {
            $this->section('Testing: getMovReport');
            
            $unitId = $this->option('unitId') ?: $sampleUnitId;
            if (!$unitId) {
                // If not provided and no vehicles fetched yet, try listing first to fetch a sample unitId
                try {
                    $listResponse = $ztrack->getVehicleLists();
                    $vehicles = $listResponse['data'] ?? [];
                    if (!empty($vehicles)) {
                        $unitId = $vehicles[0]['unitId'] ?? null;
                    }
                } catch (\Exception $ex) {
                    // Ignore, we will prompt
                }
            }

            if (!$unitId) {
                $unitId = $this->ask('Please enter a Unit ID (unitId) to query movement report');
            }

            if (!$unitId) {
                $this->error('Movement report requires a valid unitId (Unit ID).');
                return 1;
            }

            $st = $this->option('st') ?: date('Y-m-d 00:00:00');
            $ed = $this->option('ed') ?: date('Y-m-d 23:59:59');

            $this->info("Fetching movement report for Unit ID: {$unitId}");
            $this->info("Timeframe: {$st} to {$ed}");

            try {
                $response = $ztrack->getMovReport($unitId, $st, $ed);
                $this->success('getMovReport fetched successfully!');
                $this->line(json_encode($response, JSON_PRETTY_PRINT));
            } catch (ZTrackException $e) {
                $this->error("getMovReport failed: " . $e->getMessage());
                if ($e->getResponsePayload()) {
                    $this->line(json_encode($e->getResponsePayload(), JSON_PRETTY_PRINT));
                }
            }
        }

        $this->success("\n--- ZTrack Integration Test Complete ---");
        return 0;
    }

    /**
     * Display configuration headers.
     */
    protected function displayConfig(): void
    {
        $baseUrl = config('ztrack.base_url');
        $token = config('ztrack.token');
        
        $maskedToken = 'Not configured';
        if ($token && $token !== 'YOUR_ZTRACK_API_TOKEN_PLACEHOLDER') {
            $maskedToken = substr($token, 0, 4) . str_repeat('*', max(0, strlen($token) - 8)) . substr($token, -4);
        } elseif ($token) {
            $maskedToken = 'PLACEHOLDER (' . $token . ')';
        }

        $this->table(
            ['Configuration Option', 'Active Value'],
            [
                ['ZTrack API Base URL', $baseUrl],
                ['ZTrack Token', $maskedToken],
                ['SID Cache TTL (sec)', config('ztrack.cache_ttl') . ' seconds (' . (config('ztrack.cache_ttl') / 3600) . ' hours)']
            ]
        );
    }

    /**
     * Helper formatting methods for nice CLI look.
     */
    protected function title(string $text): void
    {
        $this->line('');
        $this->line(str_repeat('=', strlen($text)));
        $this->info($text);
        $this->line(str_repeat('=', strlen($text)));
        $this->line('');
    }

    protected function section(string $text): void
    {
        $this->line('');
        $this->line(str_repeat('-', strlen($text)));
        $this->comment($text);
        $this->line(str_repeat('-', strlen($text)));
    }

    protected function success(string $text): void
    {
        $this->line("<info>{$text}</info>");
    }
}
