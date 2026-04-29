<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('depots', function (Blueprint $table) {
            $table->string('password')->nullable()->after('oil_company_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('depot_id')->nullable()->after('company_id');
        });
    }

    public function down(): void
    {
        Schema::table('depots', function (Blueprint $table) {
            $table->dropColumn('password');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('depot_id');
        });
    }
};
