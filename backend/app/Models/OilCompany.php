<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OilCompany extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'person1',
        'person2',
        'phone1',
        'phone2',
        'email1',
        'email2',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'company_id');
    }

    public function depots()
    {
        return $this->hasMany(Depot::class);
    }
}
