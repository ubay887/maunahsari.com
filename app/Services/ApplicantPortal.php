<?php

namespace App\Services;

use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;

/** Data pendaftaran yang boleh dilihat calon santri sendiri; bidang internal admin tidak pernah ikut. */
class ApplicantPortal
{
    /** @return array<string, mixed> */
    public function summary(Applicant $applicant): array
    {
        $applicant->loadMissing(['program', 'registrationPeriod']);

        return [
            'registration_number' => $applicant->registration_number,
            'full_name' => $applicant->full_name,
            'guardian_name' => $applicant->guardian_name,
            'status' => $applicant->status->value,
            'status_label' => $applicant->status->label(),
            'pondok' => $applicant->pondok->label(),
            'residence_type' => $applicant->residence_type->label(),
            'program' => $applicant->program->name,
            'period' => $applicant->registrationPeriod->name,
            'registered_at' => $applicant->created_at?->toIso8601String(),
            'visit_scheduled_at' => $applicant->visit_scheduled_at?->toIso8601String(),
            'decision_reason' => $applicant->status === ApplicantStatus::Rejected ? $applicant->decision_reason : null,
            'can_edit' => $applicant->status === ApplicantStatus::Registered,
            'contact' => $applicant->registrationPeriod->getAttribute('contact_whatsapp_'.$applicant->pondok->value),
            'fee_url' => $applicant->registrationPeriod->getAttribute('fee_url_'.$applicant->pondok->value),
        ];
    }

    /**
     * Catatan administrasi milik pendaftar; pencatat (recorded_by) tidak ikut.
     *
     * @return array{total: int, items: list<array{id: int, amount: int, paid_at: string, note: string|null}>}
     */
    public function payments(Applicant $applicant): array
    {
        $payments = $applicant->payments()->orderByDesc('paid_at')->orderByDesc('id')->get();

        return [
            'total' => (int) $payments->sum('amount'),
            'items' => $payments->map(fn ($payment): array => ['id' => $payment->id, 'amount' => $payment->amount, 'paid_at' => $payment->paid_at->toIso8601String(), 'note' => $payment->note])->all(),
        ];
    }

    /** @return list<array{type: string, label: string, id: int|null, original_name: string|null, size: int|null, is_verified: bool}> */
    public function documents(Applicant $applicant): array
    {
        $uploaded = $applicant->documents()->get()->keyBy(fn ($document): string => $document->type->value);

        return array_map(function (DocumentType $type) use ($uploaded): array {
            $document = $uploaded->get($type->value);

            return ['type' => $type->value, 'label' => $type->label(), 'id' => $document?->id, 'original_name' => $document?->original_name, 'size' => $document?->size, 'is_verified' => $document?->is_verified ?? false];
        }, DocumentType::cases());
    }

    /** @return list<array{status: string, status_label: string, at: string|null}> */
    public function history(Applicant $applicant): array
    {
        return $applicant->statusHistories()->orderBy('created_at')->orderBy('id')->get()->map(fn ($history): array => ['status' => $history->to_status->value, 'status_label' => $history->to_status->label(), 'at' => $history->created_at?->toIso8601String()])->all();
    }
}
