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
    ];
}
