<?php

namespace Database\Seeders;

use App\Models\Dispatch;
use App\Models\OilCompany;
use App\Models\Transporter;
use App\Models\Vehicle;
use App\Models\Depot;
use Illuminate\Database\Seeder;

class DispatchSeeder extends Seeder
{
    public function run(): void
    {
        $nocCompany = OilCompany::where('name', 'NOC')->first();
        $olaCompany = OilCompany::where('name', 'OLA')->first();
        $totalCompany = OilCompany::where('name', 'TOTAL')->first();

        $horizonTransporter = Transporter::where('name', 'Horizon-Djb')->first();
        $eagleTransporter = Transporter::where('name', 'EAGLE')->first();

        $veh11111 = Vehicle::where('vehicle_id', 'veh-3-11111')->first();
        $veh2222 = Vehicle::where('vehicle_id', 'veh-3-2222')->first();
        $veh3333 = Vehicle::where('vehicle_id', 'veh-3-3333')->first();
        $veh4444 = Vehicle::where('vehicle_id', 'veh-3-4444')->first();

        $depot1 = Depot::where('code', 'ID8548')->first();
        $depot2 = Depot::where('code', 'ID6341')->first();
        $depot3 = Depot::where('code', 'ID4025')->first();

        // PEA001
        Dispatch::create([
            'pea_dispatch_no' => 'PEA001',
            'oil_company_id' => $nocCompany->id,
            'transporter_id' => $horizonTransporter->id,
            'vehicle_id' => $veh11111->id,
            'destination_depot_id' => $depot1->id,
            'dispatch_date_time' => '2025-12-02 21:52:30',
            'dispatch_location' => 'Horizon-Djb',
            'eta_date_time' => '2025-12-06 10:22:00',
            'fuel_type' => 'Diesel',
            'dispatched_liters' => 32000,
            'drop_off_date_time' => '2025-12-06 10:22:32',
            'drop_off_location' => 'Addis Ababa, ID8548',
            'status' => 'Delivered',
            'last_gps_lat' => 9.03,
            'last_gps_lng' => 38.74,
            'last_gps_timestamp' => '2025-12-06 09:50:00',
        ]);

        // PEA008
        Dispatch::create([
            'pea_dispatch_no' => 'PEA008',
            'oil_company_id' => $olaCompany->id,
            'transporter_id' => $horizonTransporter->id,
            'vehicle_id' => $veh2222->id,
            'destination_depot_id' => $depot2->id,
            'dispatch_date_time' => '2025-12-06 01:00:30',
            'dispatch_location' => 'Horizon-Djb',
            'eta_date_time' => '2025-12-08 17:05:00',
            'fuel_type' => 'Benzine',
            'dispatched_liters' => 28000,
            'status' => 'Exceeded ETA',
            'last_gps_lat' => 8.9,
            'last_gps_lng' => 38.8,
            'last_gps_timestamp' => '2025-12-08 22:40:00',
        ]);

        // PEA014
        Dispatch::create([
            'pea_dispatch_no' => 'PEA014',
            'oil_company_id' => $totalCompany->id,
            'transporter_id' => $eagleTransporter->id,
            'vehicle_id' => $veh3333->id,
            'destination_depot_id' => $depot3->id,
            'dispatch_date_time' => '2025-12-01 21:52:30',
            'dispatch_location' => 'Horizon-Djb',
            'eta_date_time' => '2025-12-05 17:05:00',
            'fuel_type' => 'Jet Fuel',
            'dispatched_liters' => 24000,
            'status' => 'GPS Offline >24h',
            'last_gps_lat' => 9.4,
            'last_gps_lng' => 39.2,
            'last_gps_timestamp' => '2025-12-04 08:15:00',
        ]);

        // PEA032
        Dispatch::create([
            'pea_dispatch_no' => 'PEA032',
            'oil_company_id' => $nocCompany->id,
            'transporter_id' => $eagleTransporter->id,
            'vehicle_id' => $veh4444->id,
            'destination_depot_id' => $depot1->id,
            'dispatch_date_time' => '2025-12-10 05:31:30',
            'dispatch_location' => 'Horizon-Djb',
            'eta_date_time' => '2025-12-15 13:27:00',
            'fuel_type' => 'Diesel',
            'dispatched_liters' => 30000,
            'status' => 'Stopped >5h',
            'last_gps_lat' => 9.02,
            'last_gps_lng' => 38.78,
            'last_gps_timestamp' => '2025-12-12 16:00:00',
        ]);

        // PEA045
        Dispatch::create([
            'pea_dispatch_no' => 'PEA045',
            'oil_company_id' => $totalCompany->id,
            'transporter_id' => $eagleTransporter->id,
            'vehicle_id' => $veh3333->id,
            'destination_depot_id' => $depot3->id,
            'dispatch_date_time' => '2025-12-11 10:00:00',
            'dispatch_location' => 'Horizon-Djb',
            'eta_date_time' => '2025-12-16 10:00:00',
            'fuel_type' => 'Benzine',
            'dispatched_liters' => 45000,
            'status' => 'On transit',
            'last_gps_lat' => 9.1,
            'last_gps_lng' => 39.0,
            'last_gps_timestamp' => '2025-12-12 10:00:00',
        ]);
    }
}
