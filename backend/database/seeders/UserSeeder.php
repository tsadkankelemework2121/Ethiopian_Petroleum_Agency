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
            'role' => 'EPA_ADMIN',
        ]);

        User::create([
            'name' => 'OLA Admin',
            'email' => 'admin@ola.com',
            'password' => Hash::make('admin123'),
            'role' => 'OIL_COMPANY',
            'company_id' => 'OLA',
        ]);
    }
}
