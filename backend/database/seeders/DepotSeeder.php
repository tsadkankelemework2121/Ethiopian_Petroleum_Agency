<?php

namespace Database\Seeders;

use App\Models\Depot;
use App\Models\OilCompany;
use Illuminate\Database\Seeder;

class DepotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get NOC oil company
        $noc = OilCompany::where('company_id', 'oc-noc')->first();

        Depot::create([
            'depot_id' => 'ID8548',
            'name' => 'Depot 1',
            'region' => 'Addis Ababa',
            'city' => 'Addis Ababa',
            'address' => 'Bole, Airport Road',
            'person1' => 'Depot Contact 1',
            'phone1' => '+251 911 300 111',
            'phone2' => '+251 911 300 222',
            'email1' => 'depot1@epa.et',
            'latitude' => 9.0192,
            'longitude' => 38.7525,
            'oil_company_id' => $noc?->id,
        ]);

        Depot::create([
            'depot_id' => 'ID6341',
            'name' => 'Depot 2',
            'region' => 'Oromia',
            'city' => 'Adama',
            'address' => 'Main Depot Avenue',
            'person1' => 'Depot Contact 2',
            'phone1' => '+251 911 310 111',
            'phone2' => '+251 911 310 222',
            'email1' => 'depot2@epa.et',
            'latitude' => 8.541,
            'longitude' => 39.269,
        ]);

        Depot::create([
            'depot_id' => 'ID4025',
            'name' => 'Depot 3',
            'region' => 'Amhara',
            'city' => 'Bahir Dar',
            'address' => 'Industrial Zone',
            'person1' => 'Depot Contact 3',
            'phone1' => '+251 911 320 111',
            'phone2' => '+251 911 320 222',
            'email1' => 'depot3@epa.et',
            'latitude' => 11.5936,
            'longitude' => 37.3908,
        ]);
    }
}
