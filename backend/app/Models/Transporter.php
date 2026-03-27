<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transporter extends Model
{
    protected $fillable = [
        'transporter_id',
        'name',
        'region',
        'city',
        'address',
        'contact_person1',
        'contact_person2',
        'phone1',
        'phone2',
        'email',
        'oil_company_id',
    ];

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function oilCompany(): BelongsTo
    {
        return $this->belongsTo(OilCompany::class);
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(Dispatch::class);
    }
}
