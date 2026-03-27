<?php

namespace Database\Seeders;

use App\Models\Transporter;
use App\Models\OilCompany;
use Illuminate\Database\Seeder;

class TransporterSeeder extends Seeder
{
    public function run(): void
    {
        $nocCompany = OilCompany::where('name', 'NOC')->first();
        $olaCompany = OilCompany::where('name', 'OLA')->first();

        // Horizon-Djb
        Transporter::create([
            'transporter_id' => 'tr-horizon',
            'name' => 'Horizon-Djb',
            'region' => 'Addis Ababa',
            'city' => 'Addis Ababa',
            'address' => 'Ring Road, Logistics Hub',
            'contact_person1' => 'Contact Person 1',
            'contact_person2' => 'Contact Person 2',
            'phone1' => '+251 911 400 111',
            'phone2' => '+251 911 400 222',
            'email' => 'ops@horizon.example',
            'oil_company_id' => $nocCompany?->id,
        ]);

        // EAGLE
        Transporter::create([
            'transporter_id' => 'tr-eagle',
            'name' => 'EAGLE',
            'region' => 'Oromia',
            'city' => 'Adama',
            'address' => 'Dry Port Road',
            'contact_person1' => 'Contact Person 1',
            'contact_person2' => 'Contact Person 2',
            'phone1' => '+251 911 410 111',
            'phone2' => '+251 911 410 222',
            'email' => 'dispatch@eagle.example',
            'oil_company_id' => null,
        ]);
    }
}
