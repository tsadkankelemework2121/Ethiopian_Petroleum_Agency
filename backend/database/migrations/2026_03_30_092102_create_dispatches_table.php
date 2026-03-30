<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('pea_dispatch_no')->unique();
            $table->string('oil_company_id');
            $table->string('transporter_id');
            $table->string('vehicle_id');
            $table->dateTime('dispatch_datetime');
            $table->string('dispatch_location');
            $table->foreignId('destination_depot_id')->constrained('depots')->onDelete('cascade');
            $table->dateTime('eta_datetime');
            $table->dateTime('drop_off_datetime')->nullable();
            $table->string('fuel_type');
            $table->decimal('dispatched_liters', 12, 2);
            $table->string('status')->default('On transit');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatches');
    }
};
