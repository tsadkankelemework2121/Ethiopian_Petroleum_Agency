<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use App\Models\Transporter;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $horizonTransporter = Transporter::where('name', 'Horizon-Djb')->first();
        $eagleTransporter = Transporter::where('name', 'EAGLE')->first();

        // Horizon-Djb vehicles
        Vehicle::create([
            'vehicle_id' => 'veh-3-11111',
            'transporter_id' => $horizonTransporter->id,
            'plate_reg_no' => '3-11111 ET',
            'trailer_reg_no' => 'TR-7788',
            'manufacturer' => 'Mercedes-Benz',
            'model' => 'Actros',
            'year_of_manufacture' => 2021,
            'side_no' => 'S-12',
            'driver_name' => 'Driver A',
            'driver_phone' => '+251 911 500 111',
        ]);

        Vehicle::create([
            'vehicle_id' => 'veh-3-2222',
            'transporter_id' => $horizonTransporter->id,
            'plate_reg_no' => '3-2222 ET',
            'trailer_reg_no' => 'TR-1133',
            'manufacturer' => 'Mercedes-Benz',
            'model' => 'Arocs',
            'year_of_manufacture' => 2020,
            'side_no' => 'S-07',
            'driver_name' => 'Driver B',
            'driver_phone' => '+251 911 500 222',
        ]);

        // EAGLE vehicles
        Vehicle::create([
            'vehicle_id' => 'veh-3-3333',
            'transporter_id' => $eagleTransporter->id,
            'plate_reg_no' => '3-3333 ET',
            'trailer_reg_no' => 'TR-5566',
            'manufacturer' => 'MAN',
            'model' => 'TGX',
            'year_of_manufacture' => 2022,
            'side_no' => 'S-21',
            'driver_name' => 'Driver C',
            'driver_phone' => '+251 911 500 333',
        ]);

        Vehicle::create([
            'vehicle_id' => 'veh-3-4444',
            'transporter_id' => $eagleTransporter->id,
            'plate_reg_no' => '3-4444 ET',
            'trailer_reg_no' => 'TR-9901',
            'manufacturer' => 'Volvo',
            'model' => 'FH',
            'year_of_manufacture' => 2019,
            'side_no' => 'S-03',
            'driver_name' => 'Driver D',
            'driver_phone' => '+251 911 500 444',
        ]);
    }
}
