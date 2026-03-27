<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depot extends Model
{
    protected $fillable = [
        'depot_id',
        'name',
        'region',
        'city',
        'address',
        'person1',
        'person2',
        'phone1',
        'phone2',
        'email1',
        'email2',
        'latitude',
        'longitude',
        'map_link',
        'oil_company_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function oilCompany()
    {
        return $this->belongsTo(OilCompany::class);
    }
}
