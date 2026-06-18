<?php

namespace App\Services\ZTrack;

use App\Exceptions\ZTrackException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZTrackService
{
    /**
     * Cache key for storing the active ZTrack SID.
     */
    protected const CACHE_KEY = 'ztrack_sid';

    /**
     * Get the active Session ID (SID).
     * Attempts to retrieve it from cache first; if not found, authenticates to get a fresh one.
     *
     * @return string
     * @throws ZTrackException
     */
    public function getSid(): string
    {
        $sid = Cache::get(self::CACHE_KEY);

        if (!$sid) {
            Log::info('ZTrack SID not found in cache. Authenticating...');
            $sid = $this->authenticate();
            
            $ttl = config('ztrack.cache_ttl', 86400);
            Cache::put(self::CACHE_KEY, $sid, $ttl);
            Log::info('ZTrack SID cached successfully.', ['ttl' => $ttl]);
        }

        return $sid;
    }

    /**
     * Authenticate with the ZTrack API using the configured token to fetch a new SID.
     *
     * @return string
     * @throws ZTrackException
     */
    public function authenticate(): string
    {
        $baseUrl = config('ztrack.base_url');
        $token = config('ztrack.token');

        if (empty($token) || $token === 'YOUR_ZTRACK_API_TOKEN_PLACEHOLDER') {
            throw new ZTrackException('ZTrack API token is not configured or is set to placeholder.');
        }

        $endpoint = rtrim($baseUrl, '/') . '/getSidByToken';

        try {
            $response = Http::timeout(30)->post($endpoint, [
                'token' => $token
            ]);
        } catch (\Exception $e) {
            Log::error('ZTrack API communication failed during authentication.', [
                'error' => $e->getMessage()
            ]);
            throw new ZTrackException('Failed to communicate with ZTrack API: ' . $e->getMessage(), 0, null, $e);
        }

        if ($response->failed()) {
            Log::error('ZTrack Authentication request failed.', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new ZTrackException(
                "ZTrack Authentication returned HTTP status {$response->status()}",
                $response->status(),
                $response->json()
            );
        }

        $data = $response->json();

        // Validate the structure of the authentication response
        $success = $data['success'] ?? false;
        $auth = $data['auth'] ?? false;

        if (!$success || !$auth) {
            $msg = $data['msg'] ?? 'Unknown authentication error';
            Log::error('ZTrack Authentication failed.', ['response' => $data]);
            throw new ZTrackException("ZTrack authentication failed: {$msg}", 401, $data);
        }

        $sid = $data['data']['sid'] ?? null;

        if (empty($sid)) {
            Log::error('ZTrack Authentication response missing sid.', ['response' => $data]);
            throw new ZTrackException('ZTrack Authentication response missing dynamic SID.', 500, $data);
        }

        return $sid;
    }

    /**
     * Fetch all vehicles list.
     *
     * @return array
     * @throws ZTrackException
     */
    public function getVehicleLists(): array
    {
        return $this->request('getVehicleLists');
    }

    /**
     * Fetch real-time status of all vehicles.
     *
     * @return array
     * @throws ZTrackException
     */
    public function getVehicleStatus(): array
    {
        return $this->request('getVehicleStatus');
    }

    /**
     * Fetch movement history report for a vehicle.
     *
     * @param int|string $unitId Vehicle identifier
     * @param string $startTime Start time (format: Y-m-d H:i:s)
     * @param string $endTime End time (format: Y-m-d H:i:s)
     * @return array
     * @throws ZTrackException
     */
    public function getMovReport($unitId, string $startTime, string $endTime): array
    {
        return $this->request('getMovReport', [
            'unitId' => (int) $unitId,
            'st' => $startTime,
            'ed' => $endTime
        ]);
    }

    /**
     * Clear the cached Session ID (SID).
     *
     * @return void
     */
    public function clearCachedSid(): void
    {
        Cache::forget(self::CACHE_KEY);
        Log::info('ZTrack cached SID has been cleared.');
    }

    /**
     * Perform an API request with auto-retry on SID expiration.
     *
     * @param string $endpoint The API endpoint
     * @param array $payload Additional request parameters
     * @param bool $isRetry Internal flag to prevent infinite loops
     * @return array
     * @throws ZTrackException
     */
    protected function request(string $endpoint, array $payload = [], bool $isRetry = false): array
    {
        $baseUrl = config('ztrack.base_url');
        $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        $sid = $this->getSid();
        $fullPayload = array_merge(['sid' => $sid], $payload);

        try {
            Log::debug("ZTrack: Sending request to endpoint: {$endpoint}", [
                'url' => $url,
                'payload' => array_merge($fullPayload, ['sid' => '***' . substr($sid, -6)]),
                'isRetry' => $isRetry,
            ]);

            $response = Http::timeout(60)->post($url, $fullPayload);
        } catch (\Exception $e) {
            Log::error("ZTrack: HTTP communication failed.", [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);
            throw new ZTrackException("Communication failure on ZTrack endpoint {$endpoint}: " . $e->getMessage(), 0, null, $e);
        }

        // Log raw response details for debugging
        Log::debug("ZTrack: Raw response received for {$endpoint}", [
            'http_status' => $response->status(),
            'body_length' => strlen($response->body()),
            'body_preview' => substr($response->body(), 0, 500),
        ]);

        if ($response->failed()) {
            Log::error("ZTrack: HTTP failure response.", [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new ZTrackException(
                "ZTrack endpoint {$endpoint} returned HTTP status {$response->status()}",
                $response->status(),
                $response->json()
            );
        }

        $data = $response->json();

        Log::debug("ZTrack: Parsed JSON response for {$endpoint}", [
            'auth' => $data['auth'] ?? 'not set',
            'success' => $data['success'] ?? 'not set',
            'msg' => $data['msg'] ?? 'not set',
            'data_type' => isset($data['data']) ? (is_array($data['data']) ? 'array(' . count($data['data']) . ')' : gettype($data['data'])) : 'not set',
        ]);

        // Detect explicit auth failure
        $isAuthFailure = false;
        if (isset($data['auth']) && $data['auth'] === false) {
            $isAuthFailure = true;
        }

        // Check for success: false (could be stale SID or genuine API error)
        $success = $data['success'] ?? false;

        if ($isAuthFailure || !$success) {
            // On the FIRST attempt, always retry with a fresh SID.
            // ZTrack sometimes returns success:false with misleading messages
            // (e.g. "No units found or API response malformed") when the SID
            // is actually expired, instead of returning auth:false.
            if (!$isRetry) {
                $msg = $data['msg'] ?? 'unknown';
                Log::warning("ZTrack: Request failed on first attempt (auth={$data['auth']}, success={$data['success']}, msg={$msg}). Clearing SID cache and retrying with fresh SID.", [
                    'endpoint' => $endpoint,
                    'response' => $data,
                ]);
                $this->clearCachedSid();
                return $this->request($endpoint, $payload, true);
            }

            // On the retry (second attempt), this is a genuine failure
            if ($isAuthFailure) {
                Log::error("ZTrack: Authentication still failing after SID refresh.", [
                    'endpoint' => $endpoint,
                    'response' => $data,
                ]);
                throw new ZTrackException(
                    "ZTrack session authentication failed repeatedly: " . ($data['msg'] ?? 'Session invalid'),
                    401,
                    $data
                );
            }

            $msg = $data['msg'] ?? 'API request returned success as false';
            Log::error("ZTrack: API returned error status on retry.", [
                'endpoint' => $endpoint,
                'response' => $data,
            ]);
            throw new ZTrackException("ZTrack API error on {$endpoint}: {$msg}", 400, $data);
        }

        return $data;
    }
}
