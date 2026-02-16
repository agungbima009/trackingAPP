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
        Schema::table('taken_tasks', function (Blueprint $table) {
            // Drop the single user_id column
            $table->dropColumn('user_id');
            // Add user_ids as JSON to support multiple users
            $table->json('user_ids')->after('task_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taken_tasks', function (Blueprint $table) {
            // Revert back to single user_id
            $table->dropColumn('user_ids');
            $table->uuid('user_id')->after('task_id');
        });
    }
};
