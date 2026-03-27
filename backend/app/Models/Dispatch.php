<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispatch extends Model
{
    protected $fillable = [
        'pea_dispatch_no',
        'oil_company_id',
        'transporter_id',
        'vehicle_id',
        'destination_depot_id',
        'dispatch_date_time',
        'dispatch_location',
        'eta_date_time',
        'fuel_type',
        'dispatched_liters',
        'drop_off_date_time',
        'drop_off_location',
        'status',
        'last_gps_lat',
        'last_gps_lng',
        'last_gps_timestamp',
    ];

    protected $casts = [
        'dispatch_date_time' => 'datetime',
        'eta_date_time' => 'datetime',
        'drop_off_date_time' => 'datetime',
        'last_gps_timestamp' => 'datetime',
    ];

    public function oilCompany(): BelongsTo
    {
        return $this->belongsTo(OilCompany::class);
    }

    public function transporter(): BelongsTo
    {
        return $this->belongsTo(Transporter::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function depot(): BelongsTo
    {
        return $this->belongsTo(Depot::class, 'destination_depot_id');
    }
}
