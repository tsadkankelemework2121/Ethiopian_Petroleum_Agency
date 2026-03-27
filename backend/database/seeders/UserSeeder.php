<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'EPA Admin',
            'email' => 'admin@epa.com',
            'password' => Hash::make('admin123'),
            'role' => 'epa_admin',
        ]);

        User::create([
            'name' => 'Oil Company Admin',
            'email' => 'admin@oilcompany.com',
            'password' => Hash::make('admin123'),
            'role' => 'oil_company',
            'company_id' => 1,
        ]);
    }
}
