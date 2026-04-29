<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \App\Models\User::create(['name' => 'Test Admin', 'email' => 'test_depot_error2@ola.com', 'password' => 'hashed', 'role' => 'DEPOT_ADMIN', 'company_id' => '1', 'depot_id' => 1]);
    echo 'Success';
} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
