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
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('location_id')->primary();
            $table->uuid('taken_task_id');
            $table->uuid('user_id');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('accuracy', 8, 2)->nullable()->comment('Accuracy in meters');
            $table->string('address')->nullable();
            $table->enum('tracking_status', ['auto', 'manual'])->default('auto');
            $table->timestamp('recorded_at');
            $table->timestamps();
            
            $table->foreign('taken_task_id')->references('taken_task_id')->on('taken_tasks')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['taken_task_id', 'user_id']);
            $table->index('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
