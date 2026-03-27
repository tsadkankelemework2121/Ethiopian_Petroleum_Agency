<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transporters', function (Blueprint $table) {
            $table->id();
            $table->string('transporter_id')->unique();
            $table->string('name');
            $table->string('region');
            $table->string('city');
            $table->string('address');
            $table->string('contact_person1')->nullable();
            $table->string('contact_person2')->nullable();
            $table->string('phone1')->nullable();
            $table->string('phone2')->nullable();
            $table->string('email')->nullable();
            $table->unsignedBigInteger('oil_company_id')->nullable();
            $table->foreign('oil_company_id')->references('id')->on('oil_companies')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transporters');
    }
};
