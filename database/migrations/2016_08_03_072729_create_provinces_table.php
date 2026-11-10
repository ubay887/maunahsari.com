<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProvincesTable extends Migration
{
    protected function connection(): string
    {
        // New config (optional)
        return config('laravolt.indonesia.database.connection')
            // Backward compatibility
            ?? config('database.default');
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection($this->connection())->create(config('laravolt.indonesia.table_prefix').'provinces', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('code', 2)->unique();
            $table->string('name', 255);
            $table->text('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection($this->connection())->drop(config('laravolt.indonesia.table_prefix').'provinces');
    }
}
