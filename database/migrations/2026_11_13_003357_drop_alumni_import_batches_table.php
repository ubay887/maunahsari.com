<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('alumni_import_batches');
    }

    public function down(): void
    {
        Schema::create('alumni_import_batches', function (Blueprint $table): void {
            $table->id();
            $table->string('file_name');
            $table->string('status')->default('completed')->index();
            $table->unsignedInteger('total');
            $table->unsignedInteger('created_count');
            $table->unsignedInteger('failed_count');
            $table->json('errors')->nullable();
            $table->json('payload')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }
};
