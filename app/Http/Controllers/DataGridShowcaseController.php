<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DataGridShowcaseController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('data-grid-showcase', [
            'invoices' => Inertia::defer(fn (): array => $this->demoInvoices(), rescue: true),
        ]);
    }

    /**
     * @return list<array{id: string, number: string, customer: string, email: string, status: string, plan: string, amount: int, issued: string}>
     */
    private function demoInvoices(): array
    {
        $customers = [
            ['Nabila Rahma', 'nabila'], ['Farhan Pratama', 'farhan'],
            ['Dewi Anggraini', 'dewi'], ['Rizky Saputra', 'rizky'],
            ['Salsabila Putri', 'salsabila'], ['Aditya Nugraha', 'aditya'],
            ['Aulia Maharani', 'aulia'], ['Fajar Ramadhan', 'fajar'],
            ['Intan Permata', 'intan'], ['Reza Firmansyah', 'reza'],
            ['Nadia Safitri', 'nadia'], ['Bima Wicaksono', 'bima'],
            ['Tiara Lestari', 'tiara'], ['Dimas Hidayat', 'dimas'],
            ['Citra Amelia', 'citra'], ['Arif Maulana', 'arif'],
        ];
        $plans = ['Starter', 'Pro', 'Business'];
        $statuses = ['paid', 'pending', 'paid', 'overdue', 'paid', 'pending'];
        $invoices = [];

        for ($index = 0; $index < 48; $index++) {
            [$name, $email] = $customers[$index % count($customers)];

            $invoices[] = [
                'id' => sprintf('invoice-%03d', $index + 1),
                'number' => sprintf('INV-2026-%03d', $index + 1),
                'customer' => $name,
                'email' => $email.'@example.test',
                'status' => $statuses[$index % count($statuses)],
                'plan' => $plans[$index % count($plans)],
                'amount' => 149000 + ($index % 9) * 65000 + intdiv($index, 16) * 45000,
                'issued' => sprintf('2026-%02d-%02d', 9 + intdiv($index, 16), 2 + $index % 16),
            ];
        }

        return $invoices;
    }
}
