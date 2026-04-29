<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depot extends Model
{
    protected $fillable = [
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
        'lat',
        'lng',
        'map_link',
        'oil_company_id',
        'password',
    ];



    public function dispatches()
    {
        return $this->hasMany(Dispatch::class, 'destination_depot_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'depot_id');
    }

    public function deliveryConfirmations()
    {
        return $this->hasMany(DeliveryConfirmation::class);
    }
}
