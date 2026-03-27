<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_id')->unique();
            $table->unsignedBigInteger('transporter_id');
            $table->string('plate_reg_no');
            $table->string('trailer_reg_no');
            $table->string('manufacturer');
            $table->string('model');
            $table->integer('year_of_manufacture');
            $table->string('side_no');
            $table->string('driver_name');
            $table->string('driver_phone');
            $table->foreign('transporter_id')->references('id')->on('transporters')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
