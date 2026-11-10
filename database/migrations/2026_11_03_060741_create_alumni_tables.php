<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
        Schema::create('regencies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('province_id')->constrained()->restrictOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
        Schema::create('alumni_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('santri_id')->nullable()->constrained('santris')->nullOnDelete();
            $table->string('full_name');
            $table->string('gender');
            $table->string('photo_path')->nullable();
            $table->string('phone_whatsapp')->nullable();
            $table->unsignedSmallInteger('entry_year');
            $table->unsignedSmallInteger('leave_year')->nullable();
            $table->string('pondok');
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->string('alumni_status');
            $table->string('angkatan');
            $table->foreignId('province_id')->constrained()->restrictOnDelete();
            $table->foreignId('regency_id')->constrained()->restrictOnDelete();
            $table->string('activity_status');
            $table->string('profession')->nullable();
            $table->string('organization')->nullable();
            $table->string('field')->nullable();
            $table->json('skills')->nullable();
            $table->string('bio', 500)->nullable();
            $table->json('social_links')->nullable();
            $table->json('open_to')->nullable();
            $table->string('verification_status')->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('rejection_reason', 500)->nullable();
            $table->string('map_mode')->nullable();
            $table->boolean('directory_visible')->nullable();
            $table->json('field_visibility')->nullable();
            $table->string('source');
            $table->string('claim_code_hash')->nullable()->unique();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['verification_status', 'map_mode', 'regency_id']);
            $table->index(['verification_status', 'directory_visible', 'angkatan']);
        });
        Schema::create('contact_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('requester_profile_id')->constrained('alumni_profiles')->cascadeOnDelete();
            $table->foreignId('target_profile_id')->constrained('alumni_profiles')->cascadeOnDelete();
            $table->string('message', 300);
            $table->string('status')->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index(['requester_profile_id', 'created_at']);
        });
        DB::statement("CREATE UNIQUE INDEX contact_requests_pending_unique ON contact_requests (requester_profile_id, target_profile_id) WHERE status = 'pending'");
        Schema::create('consent_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('profile_id')->constrained('alumni_profiles')->cascadeOnDelete();
            $table->string('type');
            $table->string('version');
            $table->boolean('granted');
            $table->timestamp('recorded_at');
            $table->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
        Schema::create('alumni_import_batches', function (Blueprint $table): void {
            $table->id();
            $table->string('file_name');
            $table->unsignedInteger('total');
            $table->unsignedInteger('created_count');
            $table->unsignedInteger('failed_count');
            $table->json('errors')->nullable();
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['alumni_import_batches', 'audit_logs', 'consent_records', 'contact_requests', 'alumni_profiles', 'regencies', 'provinces'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
