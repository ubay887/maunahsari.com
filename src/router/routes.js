import { lazy } from 'react';

/**
 * Application route configuration.
 * Each route defines a path pattern, a lazy-loaded component, and SEO metadata.
 * Routes are matched in declaration order (first match wins).
 * The wildcard (*) route must be last to serve as the fallback.
 */
export const routes = [
  {
    path: '/',
    component: lazy(() => import('@/pages/Beranda')),
    meta: {
      id: 'beranda',
      title: "PTQ Ma'unah Sari Kediri - Portal Resmi Pesantren",
      description: "Laman informasi resmi seputar program Tahfidhul Qur'an, pendaftaran santri baru, profil kepengasuhan, dan kegiatan harian di PTQ Ma'unah Sari, Kediri."
    }
  },
  {
    path: '/profil',
    component: lazy(() => import('@/pages/Profil')),
    meta: {
      id: 'profil',
      title: "Profil Lengkap PTQ Ma'unah Sari Kediri - Sejarah & Kepengasuhan",
      description: "Mengenal sejarah berdirinya PTQ Ma'unah Sari Kediri sejak 1967 M oleh KH. M. Mubassyir Mundzir dan riwayat kepengasuhan KH. R. Abdul Hamid Abdul Qodir."
    }
  },
  {
    path: '/pendaftaran',
    component: lazy(() => import('@/pages/Pendaftaran')),
    meta: {
      id: 'pendaftaran',
      title: "Pendaftaran Santri Baru (PSB) 2026/2027 - PTQ Ma'unah Sari",
      description: "Informasi alur, syarat, berkas, rincian biaya administrasi, dan link pendaftaran online santri baru putra/putri PTQ Ma'unah Sari Kediri."
    }
  },
  {
    path: '/pondok-putra',
    component: lazy(() => import('@/pages/PondokPutra')),
    meta: {
      id: 'putra',
      title: "Pondok Putra - Program Tahfidhul Qur'an PTQ Ma'unah Sari",
      description: "Program pendidikan Al-Qur'an putra: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh 41 hari di PTQ Ma'unah Sari Kediri."
    }
  },
  {
    path: '/pondok-putri',
    component: lazy(() => import('@/pages/PondokPutri')),
    meta: {
      id: 'putri',
      title: "Pondok Putri - Program Tahfidhul Qur'an PTQ Ma'unah Sari",
      description: "Program pendidikan Al-Qur'an putri: Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, dan Riyadloh Berkala di PTQ Ma'unah Sari Lil-Banat."
    }
  },
  {
    path: '/narahubung',
    component: lazy(() => import('@/pages/Narahubung')),
    meta: {
      id: 'narahubung',
      title: "Hubungi Kami - Narahubung Resmi & Media Sosial PTQ Ma'unah Sari",
      description: "Layanan komunikasi resmi kantor putra/putri PTQ Ma'unah Sari Kediri. Kontak WhatsApp, Instagram, Facebook, YouTube, dan blog magalah santri."
    }
  },
  {
    path: '/alumni',
    component: lazy(() => import('@/pages/Alumni')),
    meta: {
      id: 'alumni',
      title: "Himpunan Alumni Ma'unah Sari (HAMAS) - PTQ Ma'unah Sari",
      description: "Portal Himpunan Alumni Ma'unah Sari (HAMAS). Data sebaran alumni dan silaturahim alumni PTQ Ma'unah Sari Kediri."
    }
  },
  {
    path: '/artikel',
    component: lazy(() => import('@/features/article/index.jsx')),
    meta: {
      id: 'artikel',
      title: "Kabar & Catatan Santri - PTQ Ma'unah Sari Kediri",
      description: "Membaca warta terbaru, artikel keislaman, sejarah, dan tips menghafal Al-Qur'an dari santri PTQ Ma'unah Sari Kediri."
    }
  },
  {
    path: '/artikel/:slug',
    component: lazy(() => import('@/features/article/index.jsx')),
    meta: {
      id: 'artikel-detail',
      title: null,
      description: null
    }
  },
  {
    path: '/login',
    component: lazy(() => import('@/pages/Login')),
    meta: {
      id: 'login',
      title: "Portal Masuk Santri & Alumni - PTQ Ma'unah Sari Kediri",
      description: "Akses portal resmi untuk calon santri baru memantau status pendaftaran PSB dan alumni untuk berjejaring dalam ikatan HAMAS."
    }
  },
  {
    path: '/portal/santri',
    component: lazy(() => import('@/pages/Portal')),
    meta: {
      id: 'portal-santri',
      title: "Portal Calon Santri - PTQ Ma'unah Sari Kediri",
      description: "Akses portal resmi untuk calon santri baru memantau status seleksi pendaftaran santri baru di PTQ Ma'unah Sari."
    }
  },
  {
    path: '/portal/alumni',
    component: lazy(() => import('@/pages/Portal')),
    meta: {
      id: 'portal-alumni',
      title: "Portal Alumni HAMAS - PTQ Ma'unah Sari Kediri",
      description: "Akses portal resmi Himpunan Alumni Ma'unah Sari (HAMAS) untuk berjejaring dan mengajukan syahadah digital."
    }
  },
  {
    path: '*',
    component: lazy(() => import('@/pages/NotFound')),
    meta: {
      id: 'not-found',
      title: "Halaman Tidak Ditemukan - PTQ Ma'unah Sari",
      description: "Halaman yang Anda cari tidak tersedia."
    }
  }
];
