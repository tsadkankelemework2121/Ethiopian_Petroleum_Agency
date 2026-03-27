<?php

namespace Database\Seeders;

use App\Models\OilCompany;
use Illuminate\Database\Seeder;

class OilCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OilCompany::create([
            'company_id' => 'oc-noc',
            'name' => 'NOC',
            'person1' => 'Abebe Kebede',
            'person2' => 'Mekdes A.',
            'phone1' => '+251 911 000 111',
            'phone2' => '+251 911 000 222',
            'email1' => 'contact@noc.et',
            'email2' => 'ops@noc.et',
        ]);

        OilCompany::create([
            'company_id' => 'oc-ola',
            'name' => 'OLA',
            'person1' => 'Samuel T.',
            'person2' => 'Hana G.',
            'phone1' => '+251 911 100 111',
            'phone2' => '+251 911 100 222',
            'email1' => 'hello@ola.et',
            'email2' => 'dispatch@ola.et',
        ]);

        OilCompany::create([
            'company_id' => 'oc-total',
            'name' => 'TOTAL',
            'person1' => 'Fitsum B.',
            'person2' => 'Sara W.',
            'phone1' => '+251 911 200 111',
            'phone2' => '+251 911 200 222',
            'email1' => 'support@total.et',
            'email2' => 'fleet@total.et',
        ]);
    }
}
