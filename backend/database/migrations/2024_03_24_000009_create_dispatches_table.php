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
            $table->string('dispatch_number')->unique();
            $table->foreignId('oil_company_id')->constrained('oil_companies')->onDelete('cascade');
            $table->foreignId('transporter_id')->constrained('transporters')->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->foreignId('origin_depot_id')->constrained('depots')->onDelete('cascade');
            $table->foreignId('destination_depot_id')->constrained('depots')->onDelete('cascade');
            $table->string('fuel_type');
            $table->decimal('fuel_amount', 10, 2);
            $table->timestamp('dispatch_time');
            $table->timestamp('eta')->nullable();
            $table->timestamp('arrival_time')->nullable();
            $table->string('status'); // moving, idle, offline, stopped, delivered, on_transit, exceeded_eta, offline_for_some_hours
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
