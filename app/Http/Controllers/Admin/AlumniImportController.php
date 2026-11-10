<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\ConfirmImportRequest;
use App\Http\Requests\Alumni\ImportRequest;
use App\Models\AlumniImportBatch;
use App\Models\User;
use App\Services\AlumniImport;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AlumniImportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/alumni/import', ['preview' => null, 'batches' => AlumniImportBatch::latest()->limit(10)->get(['id', 'file_name', 'status', 'total', 'created_count', 'failed_count', 'errors', 'created_at'])]);
    }

    public function preview(ImportRequest $request, #[CurrentUser] User $admin, AlumniImport $import): Response
    {
        return Inertia::render('admin/alumni/import', ['preview' => $import->preview($request->file('file'), $admin), 'batches' => []]);
    }

    public function store(ConfirmImportRequest $request, #[CurrentUser] User $admin, AlumniImport $import): RedirectResponse
    {
        $batch = $import->confirm($admin, $request->string('token')->toString());

        return redirect()->route('admin.alumni.import.index')->with('success', 'Impor diterima: '.$batch->total.' baris sedang diproses. Hasilnya muncul di riwayat impor.');
    }

    public function template(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $file = fopen('php://output', 'w');
            if ($file === false) {
                return;
            }
            fputcsv($file, AlumniImport::HEADERS, escape: '');
            fputcsv($file, ['Nama Alumni', 'male', '2010', '2016', 'putra', 'lulus', '2010', '35', '3571', 'bekerja', 'Pendidik', '', '', ''], escape: '');
            fclose($file);
        }, 'template-alumni.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
