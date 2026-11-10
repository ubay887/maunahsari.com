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
        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('description');
            $table->string('banner')->nullable();
            $table->dateTime('start_at');
            $table->dateTime('end_at')->index();
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('type')->default('offline');
            $table->string('location_name')->nullable();
            $table->text('address')->nullable();
            $table->text('map_url')->nullable();
            $table->text('meeting_url')->nullable();
            $table->text('registration_url')->nullable();
            $table->string('contact_whatsapp', 20)->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('organizer_id')->constrained('users')->restrictOnDelete();
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'start_at']);
        });
        Schema::create('category_event', function (Blueprint $table): void {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'event_id']);
            $table->index('event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_event');
        Schema::dropIfExists('events');
    }
};
