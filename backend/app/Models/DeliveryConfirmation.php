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

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image_path) {
            
            try {
                $base = request()->getSchemeAndHttpHost();
              
                $scriptName = request()->server('SCRIPT_NAME', '');
                $basePath = str_replace('/index.php', '', $scriptName);
                return $base . $basePath . '/storage/' . $this->image_path;
            } catch (\Exception $e) {
                return url('storage/' . $this->image_path);
            }
        }
        return null;
    }

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
