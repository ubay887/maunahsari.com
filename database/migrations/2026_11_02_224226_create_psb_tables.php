<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_periods', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('academic_year', 9);
            $table->boolean('is_open')->default(false);
            $table->timestamp('opens_at');
            $table->timestamp('closes_at')->nullable();
            foreach (['putra', 'putri'] as $pondok) {
                $table->text('fee_url_'.$pondok)->nullable();
                $table->string('contact_whatsapp_'.$pondok)->nullable();
            }
            $table->text('info_note')->nullable();
            $table->timestamps();
        });
        Schema::create('programs', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->boolean('requires_hafalan')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('program_quotas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('registration_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->string('pondok');
            $table->unsignedInteger('capacity');
            $table->boolean('is_open')->default(true);
            $table->timestamps();
            $table->unique(['registration_period_id', 'program_id', 'pondok']);
        });
        Schema::create('registration_sequences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('registration_period_id')->constrained()->cascadeOnDelete();
            $table->string('pondok');
            $table->unsignedBigInteger('last_number')->default(0);
            $table->unique(['registration_period_id', 'pondok']);
        });
        Schema::create('applicants', function (Blueprint $table): void {
            $table->id();
            $table->string('registration_number')->unique();
            $table->foreignId('registration_period_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->string('pondok');
            $table->string('residence_type');
            $table->string('source');
            $table->string('status')->default('registered');
            $table->string('full_name');
            $table->string('nickname')->nullable();
            $table->string('gender');
            $table->string('birth_place');
            $table->date('birth_date');
            $table->text('address');
            $table->string('last_education');
            $table->string('last_school');
            $table->unsignedTinyInteger('hafalan_juz')->nullable();
            $table->boolean('can_read_binnadhor')->default(false);
            $table->boolean('can_write_pegon')->default(false);
            $table->string('guardian_name');
            $table->string('guardian_relation');
            $table->string('guardian_phone');
            $table->boolean('agreed_to_rules');
            $table->timestamp('agreed_at');
            $table->timestamp('visit_scheduled_at')->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamp('sowan_done_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->text('decision_reason')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['registration_period_id', 'program_id', 'pondok', 'status'], 'applicants_quota_index');
            $table->index(['registration_period_id', 'status', 'created_at']);
        });
        Schema::create('applicant_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('path');
            $table->string('original_name');
            $table->unsignedBigInteger('size');
            $table->string('mime');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['applicant_id', 'type']);
        });
        Schema::create('applicant_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('amount');
            $table->timestamp('paid_at');
            $table->text('note')->nullable();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
        Schema::create('applicant_status_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('santris', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('applicant_id')->unique()->constrained()->restrictOnDelete();
            $table->string('full_name');
            $table->string('nickname')->nullable();
            $table->string('gender');
            $table->string('pondok');
            $table->string('residence_type');
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->string('birth_place');
            $table->date('birth_date');
            $table->text('address');
            $table->string('guardian_name');
            $table->string('guardian_phone');
            $table->string('photo_path')->nullable();
            $table->unsignedSmallInteger('entry_year');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['santris', 'applicant_status_histories', 'applicant_payments', 'applicant_documents', 'applicants', 'registration_sequences', 'program_quotas', 'programs', 'registration_periods'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
