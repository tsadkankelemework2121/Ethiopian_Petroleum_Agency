<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeRoleToStringOnUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY role VARCHAR(255) NOT NULL DEFAULT 'OIL_COMPANY'");
    }

    public function down(): void
    {
        // Reverting this might cause data loss if there are roles other than the original enum values, so we just leave it as VARCHAR or attempt to revert.
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY role ENUM('epa_admin', 'oil_company') NOT NULL DEFAULT 'oil_company'");
    }
}
