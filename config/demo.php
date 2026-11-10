<?php

use Database\Seeders\DemoRoleAccountSeeder;

/**
 * Akun demo per role. Dipakai {@see DemoRoleAccountSeeder} untuk membuat akun
 * dan halaman login untuk menampilkan tombol masuk satu klik. Hanya aktif di local/testing.
 */
return [
    'password' => 'password',

    'accounts' => [
        'admin' => [
            'label' => 'Admin',
            'description' => 'Akses penuh panel admin',
            'name' => 'Demo Admin',
            'email' => 'admin@example.test',
        ],
        'editor' => [
            'label' => 'Editor',
            'description' => 'Kelola artikel dan acara',
            'name' => 'Demo Editor',
            'email' => 'editor@example.test',
        ],
        'author' => [
            'label' => 'Penulis',
            'description' => 'Menulis artikel sendiri',
            'name' => 'Demo Penulis',
            'email' => 'author@example.test',
        ],
        'alumni' => [
            'label' => 'Alumni',
            'description' => 'Portal alumni',
            'name' => 'Demo Alumni',
            'email' => 'alumni@example.test',
        ],
        'applicant' => [
            'label' => 'Calon santri',
            'description' => 'Portal pendaftar PSB',
            'name' => 'Demo Wali Calon Santri',
            'email' => 'applicant@example.test',
        ],
    ],
];
