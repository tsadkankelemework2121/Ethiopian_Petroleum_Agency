<?php

return [
    /*
    |--------------------------------------------------------------------------
    | ZTrack API Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the settings for the ZTrack external vehicle
    | tracking system, including base URL, token, and cache settings.
    |
    */

    'base_url' => env('ZTRACK_API_BASE_URL', 'https://apiappola.ztrackinsight.com/api/thirdparty'),

    'token' => env('ZTRACK_API_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | ZTrack Cache settings
    |--------------------------------------------------------------------------
    |
    | The Session ID (SID) returned by ZTrack's authentication is cached
    | to minimize API roundtrips. Configure the TTL in seconds.
    |
    */
    'cache_ttl' => env('ZTRACK_CACHE_TTL', 86400), // Default: 24 hours
];
