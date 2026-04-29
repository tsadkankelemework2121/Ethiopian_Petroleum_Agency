<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryConfirmation extends Model
{
    protected $fillable = [
        'dispatch_id',
        'depot_id',
        'confirmed_by',
        'image_path',
        'latitude',
        'longitude',
        'vehicle_status',
        'confirmed_at',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
    ];

    public function dispatch()
    {
        return $this->belongsTo(Dispatch::class);
    }

    public function depot()
    {
        return $this->belongsTo(Depot::class);
    }

    public function confirmedByUser()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
