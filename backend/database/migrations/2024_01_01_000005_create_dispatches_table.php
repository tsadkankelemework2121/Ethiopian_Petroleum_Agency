<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('pea_dispatch_no')->unique();
            $table->unsignedBigInteger('oil_company_id');
            $table->unsignedBigInteger('transporter_id');
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('destination_depot_id');
            
            $table->dateTime('dispatch_date_time');
            $table->string('dispatch_location');
            
            $table->dateTime('eta_date_time');
            $table->string('fuel_type');
            $table->integer('dispatched_liters');
            
            $table->dateTime('drop_off_date_time')->nullable();
            $table->string('drop_off_location')->nullable();
            
            $table->string('status');
            $table->decimal('last_gps_lat', 10, 6)->nullable();
            $table->decimal('last_gps_lng', 10, 6)->nullable();
            $table->dateTime('last_gps_timestamp')->nullable();
            
            $table->foreign('oil_company_id')->references('id')->on('oil_companies')->onDelete('cascade');
            $table->foreign('transporter_id')->references('id')->on('transporters')->onDelete('cascade');
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
            $table->foreign('destination_depot_id')->references('id')->on('depots')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatches');
    }
};
