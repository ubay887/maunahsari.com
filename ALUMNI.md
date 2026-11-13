# Laporan implementasi modul Alumni

Tanggal: 3 November 2026. Versi backend yang diperiksa: Laravel 13.39.0, Inertia Laravel 3.6.0, Fortify 1.41.0, Wayfinder 0.1.23, dan Laravel Passkeys 0.2.1. Lingkup: fondasi akun, portal, direktori, administrasi, peta agregat, radar, dan pengujian. Fitur yang ditunda dalam permintaan tidak ditambahkan.

## Hasil

- Role `admin` / `alumni` diterapkan; migrasi mengangkat semua akun lama menjadi admin. Registrasi publik hanya membuat alumni, mengabaikan input role.
- Dashboard, Artikel, Event, PSB, santri, dan seluruh administrasi alumni dilindungi role. Pengaturan akun pribadi tetap dapat dipakai alumni.
- Wizard profil empat langkah, status verifikasi, edit, pengaturan privasi, permintaan kontak, unduh JSON, dan penghapusan permanen tersedia.
- Admin mendapat tabel TanStack server-side, antrean verifikasi, edit, pengaitan santri manual, CSV export, dan statistik. Admin tidak dapat menambah alumni secara manual maupun mengimpor; pendataan hanya lewat alumni sendiri.
- Peta publik hanya agregat. Peta portal menambahkan kartu yang diizinkan pada kelompok yang memenuhi ambang. Radar hanya memakai pusat wilayah dan pita jarak.
- Lapisan `AlumniPrivacy` menjadi DTO/query keluaran profil, foto, kontak, dan ekspor data sendiri; setiap keluaran profil memakai whitelist. Model tidak dikirim langsung sebagai props alumni.

## Berkas per fase

Daftar berikut memuat perubahan bermakna. Formatter penuh juga menormalkan format berkas PHP sesuai konfigurasi proyek. Direktori tidak memiliki metadata Git saat pengerjaan, sehingga `pint --dirty` tidak tersedia; digunakan Pint penuh.

### Fase 1 — fondasi dan pengamanan admin

Dibuat:

- `app/UserRole.php`, `app/AlumniStatus.php`, `app/VerificationStatus.php`, `app/MapMode.php`, `app/Visibility.php`, `app/ContactRequestStatus.php`.
- `database/migrations/2026_11_03_060740_add_role_to_users_table.php`.
- `database/migrations/2026_11_03_060741_create_alumni_tables.php`.
- Model: `app/Models/Province.php`, `Regency.php`, `AlumniProfile.php`, `ContactRequest.php`, `ConsentRecord.php`, `AuditLog.php`.
- `database/factories/AlumniProfileFactory.php`.
- `app/Http/Middleware/EnsureUserIsAdmin.php`, `EnsureApprovedAlumni.php`, `SetRoleRedirects.php`, `ThrottleAlumniRegistration.php`.
- `app/Http/Responses/RoleHomeResponse.php`, `RolePasskeyResponse.php`.
- `app/Console/Commands/MakeAdmin.php`.
- `database/seeders/AlumniRegionSeeder.php`, `AlumniDemoSeeder.php`.
- `config/alumni.php`.
- `app/Http/Controllers/Alumni/PrivacyPolicyController.php`, `PortalController.php`.
- `resources/js/pages/public/alumni-privacy.tsx`, `resources/js/pages/alumni/home.tsx`.
- `tests/Feature/AlumniFoundationTest.php`.

Diubah:

- `app/Models/User.php`, `app/Actions/Fortify/CreateNewUser.php`.
- `app/Providers/FortifyServiceProvider.php`, `AppServiceProvider.php`, `bootstrap/app.php`, `config/fortify.php`.
- `app/Services/ArticleAccess.php`: role menjadi batas utama; pembatasan editorial lama tetap berlaku bagi admin yang ditetapkan sebagai author/editor.
- `routes/web.php`, `routes/articles.php`, `routes/events.php`, `routes/psb.php`; ditambah `routes/alumni.php` yang berkembang pada fase berikutnya.
- `database/factories/UserFactory.php`, `database/seeders/DemoUserSeeder.php`, `DatabaseSeeder.php`.
- Fixture/pengharapan akses pada tes lama: `AdminArticleTest`, `AdminEventTest`, `AdminPsbTest`, `DashboardTest`, `PsbFormDataTest`, `PsbLifecycleTest`, `PsbPolicyTest`, `PublicArticleTest`, `PublicEventTest`, `RegistrationPeriodTest`; tes autentikasi `AuthenticationTest`, `RegistrationTest`, `EmailVerificationTest`, `PasswordConfirmationTest`, `VerificationNotificationTest`; `DatabaseSeederTest`.

Registrasi ditutup saat pengerjaan fondasi, kemudian dibuka setelah pemeriksaan fondasi lulus. Tes HTTP registrasi membuktikan role admin tidak dapat disisipkan.

### Fase 2 — portal, privasi, kontak, hak data

Dibuat:

- `app/Services/AlumniPrivacy.php`, `AlumniOptions.php`, `AlumniPhotos.php`.
- `app/Policies/AlumniProfilePolicy.php`.
- Actions dalam `app/Actions/Alumni/`: `SaveProfile.php`, `ManageContactRequest.php`, `DeleteAccount.php`.
- Form Requests dalam `app/Http/Requests/Alumni/`: `ProfileRequest.php`, `PrivacyRequest.php`, `ContactRequestRequest.php`, `RespondContactRequest.php`, `DeleteAccountRequest.php`.
- Controllers dalam `app/Http/Controllers/Alumni/`: `ProfileController.php`, `PrivacyController.php`, `ContactController.php`, `DataController.php`, `PhotoController.php`.
- `resources/js/layouts/alumni-layout.tsx`, `resources/js/types/alumni.ts`, `resources/js/lib/alumni.ts`.
- Komposisi komponen terpasang dalam `resources/js/components/alumni/`: `select-field.tsx`, `privacy-fields.tsx`.
- Halaman `resources/js/pages/alumni/`: `profile.tsx`, `privacy.tsx`, `contacts.tsx`, `data.tsx`.
- `tests/Feature/AlumniPortalTest.php`.

Diubah: `routes/alumni.php`, `resources/js/app.tsx`, `resources/js/layouts/app-layout.tsx`, `resources/js/pages/auth/register.tsx`, `verify-email.tsx`, `app/Http/Middleware/HandleInertiaRequests.php`, dan `app/Http/Controllers/Settings/ProfileController.php`. Penghapusan akun dari pengaturan lama juga membersihkan data alumni.

### Fase 3 — admin alumni dan direktori

Dibuat:

- `app/Services/AlumniQuery.php`.
- Actions `SaveAdminProfile.php`, `VerifyProfile.php`, `DeleteProfile.php` dalam `app/Actions/Alumni/`.
- Requests `QueryRequest.php`, `AdminProfileRequest.php`, `VerificationRequest.php` dalam `app/Http/Requests/Alumni/`.
- Controllers dalam `app/Http/Controllers/Admin/`: `AlumniController.php`, `AlumniVerificationController.php`.
- `app/Http/Controllers/Alumni/DirectoryController.php`.
- `resources/js/components/alumni/admin-page.tsx`, `filter-bar.tsx`, `cards.tsx`.
- `resources/js/lib/alumni-request.ts`.
- `resources/js/pages/admin/alumni/index.tsx`, `form.tsx`, `import.tsx`; `resources/js/pages/alumni/directory.tsx`.
- `tests/Feature/AdminAlumniTest.php`, `AlumniPrivacyTest.php`.

Diubah: `routes/alumni.php`, `resources/js/components/app-sidebar.tsx`, layout portal, DTO dan tipe alumni.

### Fase 4 — peta agregat

Dibuat:

- `app/Services/AlumniMap.php`, `AlumniMapCache.php`.
- `app/Observers/AlumniProfileObserver.php`.
- `app/Http/Requests/Alumni/MapQueryRequest.php`, `app/Http/Controllers/Alumni/MapController.php`.
- `resources/js/components/alumni/region-map.tsx`, `map-view.tsx`.
- `resources/js/pages/alumni/map.tsx`, `resources/js/pages/public/alumni-map.tsx`.
- `tests/Feature/AlumniMapTest.php`.

Diubah: `config/alumni.php`, `.env.example`, `package.json`, `package-lock.json`, `AppServiceProvider`, `routes/alumni.php`, layout publik/portal, dan tipe alumni. Dependency yang disetujui: Leaflet 1.9.4 dan `@types/leaflet` 1.9.21.

### Fase 5 — radar dan statistik

Dibuat:

- `app/Services/AlumniRadar.php`, `AlumniStatistics.php`.
- `app/Http/Requests/Alumni/RadarRequest.php`.
- `app/Http/Controllers/Alumni/RadarController.php`, `app/Http/Controllers/Admin/AlumniStatisticsController.php`.
- `resources/js/pages/alumni/radar.tsx`, `resources/js/pages/admin/alumni/statistics.tsx`.
- `tests/Feature/AlumniRadarTest.php`.

Diubah: route, navigasi, filter, dan tipe terkait. Tidak ada komponen grafik terpasang yang cocok ditemukan; statistik memakai Frame dan bar semantik sederhana, sesuai pilihan yang diperbolehkan.

### Fase 6 — audit dan kualitas

Dibuat:

- `tests/Feature/AlumniSecurityTest.php`.
- `tests/Unit/AlumniDistanceTest.php`, `tests/Unit/alumni.test.mjs`.
- Laporan `ALUMNI.md` ini.
- Screenshot QA lokal dalam `storage/app/alumni-qa/`.

Diperketat pada berkas fase sebelumnya:

- Redirect password, 2FA, passkey, dan verifikasi mengikuti role; response JSON Fortify tetap menggunakan status yang sesuai.
- `resources/js/components/passkey-verify.tsx` memakai fallback Wayfinder yang aman.
- Gate `browse-alumni` memeriksa role, email, persetujuan admin, serta pilihan privasi; endpoint foto dan navigasi juga memakai batas akses yang sesuai.
- Payload daftar admin dibatasi pada field tabel; akses WhatsApp di detail admin dicatat sebagai `contact.viewed`.
- Foto dienkode WebP untuk membuang metadata; semua file tetap pada disk privat.
- Penghapusan akun turut menghapus profil yang sebelumnya soft-deleted.
- JSON data sendiri memuat akun, profil, consent, serta riwayat permintaan kontak yang melibatkan pemilik, tanpa data profil/kontak pihak lain.
- Validasi list untuk skills/open_to, sanitasi formula pada CSV export, input keahlian dengan koma, dan header mobile diperbaiki.
- Wayfinder diregenerasi melalui `wayfinder:generate --with-form` dan plugin build. Direktori generated `resources/js/actions`, `resources/js/routes`, serta helper terkait mengikuti hasil generator; tidak ditulis manual.

## Migrasi dan seeder

Untuk instalasi baru atau lingkungan lain:

```sh
php artisan migrate --no-interaction
php artisan db:seed --class=AlumniRegionSeeder --no-interaction
php artisan wayfinder:generate --with-form --no-interaction
npm run build
```

`DatabaseSeeder` standar juga memanggil `AlumniRegionSeeder`. Tidak ada perubahan dependency PHP.

Demo pengembangan saja (data fiktif yang realistis, bukan data alumni sungguhan):

```sh
php artisan db:seed --class=AlumniDemoSeeder --no-interaction
```

Seeder demo hanya berjalan pada `local` / `testing`, menyiapkan satu admin demo dan 171 profil alumni yang deterministik (hasilnya sama di setiap mesin) dengan sebaran di 35 kota/kabupaten, termasuk kota yang hanya berisi satu alumni. Profil bervariasi dalam angkatan 2008–2021, status kesantrian, profesi, program, status verifikasi, dan pilihan privasi. Menjalankannya kembali memperbarui profil yang sama tanpa menggandakan; jangan menggunakannya untuk data nyata. `DemoSeeder` menjalankan seluruh data demo sekaligus dan berurutan sesuai ketergantungan data: akun staf, alumni, persetujuan privasi, permintaan kontak, PSB (4 periode), santri, dan jejak audit. Akun admin lama dipertahankan, sehingga total admin lokal dapat melebihi satu.

- Admin demo: `alumni-admin@example.test`.
- Alumni demo yang dapat menggunakan portal: `alumni-demo-1@example.test` (terverifikasi, peta dan direktori aktif, Kota Kediri).
- Kata sandi akun baru demo: `password`; tidak mengubah kata sandi akun yang sudah ada.

Admin produksi dibuat dengan perintah berikut, bukan form publik:

```sh
php artisan app:make-admin pengurus@example.org --name="Nama Pengurus"
```

Untuk akun baru, jalankan secara interaktif agar kata sandi diminta secara tersembunyi. Akun yang sudah ada dapat dipromosikan tanpa mengganti kata sandinya.

Migrasi dan seeder wilayah/demo telah dijalankan pada database lokal. Terverifikasi: 38 provinsi, 514 kota/kabupaten, dan 25 profil demo pada sesi QA.

## Sumber dan lisensi wilayah

Sumber adalah CSV pada paket yang sudah terpasang, `laravolt/indonesia` versi 0.45:

- `vendor/laravolt/indonesia/resources/csv/provinces.csv`.
- `vendor/laravolt/indonesia/resources/csv/cities.csv`.
- Lisensi paket: **MIT**, diperiksa pada `vendor/laravolt/indonesia/LICENSE` dan `composer.json`.
- README paket menyatakan kode/nama mengikuti Kepmendagri No. 300.2.2-2138 Tahun 2025 dan pemeriksaan silang `cahyadsn/wilayah` (MIT).
- Rujukan: [Laravolt Indonesia](https://github.com/laravolt/indonesia), [lisensi Laravolt](https://github.com/laravolt/indonesia/blob/master/LICENSE).

Seeder idempoten dengan upsert berdasarkan kode. Referensi alumni dibuat terpisah dari tabel `indonesia_*` milik PSB; tidak menambah kecamatan atau desa baru untuk modul alumni.

Sampel koordinat yang diperiksa dan diuji rentang geografisnya:

| Kode | Wilayah         |   Latitude |   Longitude |
| ---- | --------------- | ---------: | ----------: |
| 3571 | Kota Kediri     | -7.8263701 | 112.0161234 |
| 3273 | Kota Bandung    | -6.9192414 | 107.6366006 |
| 3471 | Kota Yogyakarta | -7.8032975 | 110.3743579 |

Kediri juga dicocokkan dengan rentang geografis pada [profil resmi Pemerintah Kota Kediri](https://kedirikota.go.id/page/kota-kediri). Koordinat diperlakukan sebagai pusat representatif wilayah dari dataset, bukan koordinat rumah atau hasil geocoding alamat. Koordinat tidak valid/kosong tidak dipalsukan untuk radar.

## Peta dan konfigurasi produksi

Dipilih **Leaflet 1.9.4**, dimuat dinamis di effect browser, tanpa wrapper React. Leaflet tidak memiliki peer dependency React, sehingga tidak mengikat versi React; TypeScript memakai `@types/leaflet` 1.9.21. Ini menghindari dependency wrapper tambahan dan cukup untuk marker agregat server. SSR tidak mengevaluasi Leaflet di server.

Rujukan API: [Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html).

Penyedia default: **tile standar OpenStreetMap** (`https://tile.openstreetmap.org`), tanpa key dan tanpa akun pihak ketiga. Pemakaiannya tunduk pada [kebijakan tile OSM](https://operations.osmfoundation.org/policies/tiles/) (cocok untuk trafik kecil hingga menengah, atribusi wajib). Untuk trafik besar, ganti ke penyedia komersial atau self-hosted lewat `ALUMNI_TILE_URL`, misalnya [MapTiler raster](https://docs.maptiler.com/leaflet/examples/raster-tiles-in-leaflet-js/) dengan [ketentuan atribusinya](https://www.maptiler.com/copyright/).

Contoh `.env`:

```dotenv
ALUMNI_CONTACT_NAME="Pengurus Alumni Maunahsari"
ALUMNI_CONTACT_EMAIL=alumni@example.org
ALUMNI_CONTACT_WHATSAPP=6281234567890
ALUMNI_REGISTRATION_ENABLED=true
ALUMNI_CONTACT_DAILY_LIMIT=10
# Opsional, default sudah OpenStreetMap. Isi hanya untuk mengganti penyedia, contoh MapTiler:
# ALUMNI_TILE_URL="https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=YOUR_KEY"
# ALUMNI_TILE_DARK_URL="https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=YOUR_KEY"
# ALUMNI_TILE_ATTRIBUTION="<a href='https://www.maptiler.com/copyright/'>&copy; MapTiler</a> <a href='https://www.openstreetmap.org/copyright'>&copy; OpenStreetMap contributors</a>"
```

Gunakan kontak nyata yang dikelola pengurus. Contoh kontak di atas fiktif. Bila `ALUMNI_TILE_URL` kosong, dipakai tile OpenStreetMap. Jika tile gagal dimuat, UI menjelaskan bahwa peta dasar belum tersedia, tetapi marker pusat wilayah dan ringkasan tetap dirender. Atribusi penyedia ditampilkan oleh Leaflet. URL dark mode dapat diatur terpisah; bila kosong, peta dark memakai tile yang sama.

Cache agregat memakai cache aplikasi (lokal: database), TTL 10 menit, key filter ter-hash dan versi cache. Observer saved/deleted setelah commit mengganti versi saat profil/privasi/verifikasi berubah.

## Aturan privasi dan asumsi yang diterapkan

1. `hidden` dan NULL dikeluarkan dari peta, direktori, dan radar. `anonymous` masuk agregat tetapi tidak menjadi kartu individu. Ini mengikuti batas paling ketat pada kriteria tes pengguna. Admin dan pemilik tetap dapat mengelola data sendiri secara sah.
2. Direktori/radar/kartu peta memerlukan `approved`, `map_mode=visible`, dan `directory_visible=true`. Pengunjung tidak memperoleh profil individual. Level field `public` tidak membuat halaman profil publik baru; peta publik tetap agregat.
3. Kontak tidak menjadi field kartu, bahkan bila field lain bersifat publik. Persetujuan kontak diperlukan, aksesnya diaudit dan `no-store`; penarikan izin tampil menutup akses kontak berikutnya melalui endpoint.
4. Ambang minimum kelompok minimal 3. Kota kecil digabung ke provinsi; jumlah di bawah ambang menjadi NULL dengan label “kurang dari N”. Ringkasan provinsi tidak menampilkan total tepat yang dapat langsung membongkar sisa kecil; ringkasan angkatan memakai pita jumlah.
5. Radius dihitung antar pusat kota/kabupaten di Indonesia dengan haversine. Tidak memakai geolokasi perangkat. Radius 25/50/100 km dan label pita, tanpa jarak individu yang presisi.
6. `angkatan` berupa string (maksimal 40 karakter), terpisah dari tahun masuk/keluar. Enum `App/Pondok.php` dipakai ulang.
7. PSB, `santris`, dan `programs` memang tersedia. `santri_id` memakai foreign key nullable; tidak perlu fallback kolom tanpa foreign key. Pengaitan dilakukan manual melalui ID atau kandidat nama, tanpa auto-link.
8. Perubahan biodata oleh alumni mengajukan profil kembali sebagai pending. Perubahan privasi saja mempertahankan status verifikasi dan mencatat consent baru.
9. Fitur klaim profil dan kode klaim dihapus bersama impor; kolom `claim_code_hash` dan `claimed_at` di-drop. Profil baru selalu dibuat sendiri oleh alumni (`source=self`) dan berawal tanpa izin peta/direktori.
10. Permintaan kontak pending memiliki unique index per pasangan, maksimum default 10/hari, dan kedaluwarsa setelah 30 hari. Kedaluwarsa diproses saat daftar/send diakses. Penolakan atau kedaluwarsa tidak membuka kontak.
11. Impor alumni (CSV/.xlsx, pratinjau, antrean job, riwayat batch) dan input manual oleh admin dihapus; tabel `alumni_import_batches` di-drop. Alumni mendata diri sendiri lewat halaman publik; admin hanya memverifikasi, mengedit, mengaitkan santri, dan menghapus. Foto memerlukan GD/WebP, sudah tersedia lokal.
12. Kelengkapan statistik berarti data wajib tersedia serta WhatsApp, profesi, bio, dan minimal satu keahlian telah diisi. Angka dilaporkan per angkatan.
13. Kebijakan privasi awal berbahasa Indonesia, versi `2026-11-03`; teks hukum final masih perlu ditinjau pengurus. Nama/email/WhatsApp penanggung jawab memakai konfigurasi sederhana, tanpa menambah sistem pengaturan situs.

## Verifikasi

Pemeriksaan dilakukan pada akhir fase dan diulang setelah perbaikan yang relevan. Ringkasan suite penuh yang tercatat: Fase 2 203 tes, Fase 4 218 tes, Fase 5 222 tes; seluruhnya lulus. Fase 1 sebelumnya melewati pemeriksaan fondasi saat registrasi ditutup, lalu tes registrasi setelah dibuka. Perubahan Fase 3 dan audit akhir tercakup pada suite penuh akhir.

Hasil akhir:

| Pemeriksaan                                                   | Hasil                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `vendor/bin/pint --format agent`                              | Lulus; formatter penuh dipakai karena tidak ada Git untuk `--dirty` |
| `vendor/bin/phpstan analyse --no-progress --error-format=raw` | Level 7, 0 error; tidak menambah baseline/ignore                    |
| `php artisan test --compact`                                  | 235 tes lulus                                                       |
| `npm run check:fix` lalu `npm run check`                      | Format/lint diperiksa melalui Vite Plus                             |
| `npm run types:check`                                         | Lulus, TypeScript strict                                            |
| `npm run test:unit`                                           | 47 tes Node lulus, termasuk helper alumni                           |
| `npm run build`                                               | Lulus; Wayfinder diregenerasi oleh plugin                           |
| ReUI C1–C4 dan audit checklist                                | Diperiksa pada berkas UI yang diubah                                |

Build masih menampilkan pemberitahuan toolchain tentang optional `fontaine`, directive `use no memo` komponen tabel, dan timing plugin. Tidak menghalangi build; tidak menambah dependency di luar Leaflet/tipenya yang disetujui.

### Audit route admin

- 68 definisi ber-prefix `admin/`, ditambah dashboard: **69 definisi**.
- Seluruhnya memiliki middleware role `admin`; tidak ada route yang lolos audit tanpa gate role.
- Tes mengiterasi **106 kombinasi method termasuk HEAD** dan membuktikan akun alumni mendapat 403 sebelum model binding, termasuk ID yang tidak ada.
- Tes guest mengiterasi route administrasi dan membuktikan redirect login. Pengaturan akun pribadi diuji tetap tersedia untuk alumni.

### QA browser

Chromium headless pada aplikasi lokal:

- Login admin mengarah ke dashboard; tabel admin alumni merender.
- Login alumni mengarah ke portal; direktori hanya menunjukkan empat profil demo yang diizinkan.
- Dialog permintaan kontak terbuka; radar menampilkan pita jarak.
- Wizard dapat dinavigasi, input beberapa keahlian dengan koma tetap utuh, dan langkah persetujuan privasi tersedia.
- Request admin dari sesi alumni menghasilkan 403.
- Lebar viewport dan dokumen sama-sama 390 px pada direktori dan peta; tidak ada overflow horizontal.
- Light/dark mode diperiksa; tidak ada `pageerror` JavaScript pada sesi portal yang diuji.
- Tile produksi belum dapat diuji terhadap penyedia karena key belum dikonfigurasi.

Screenshot: `storage/app/alumni-qa/admin-alumni-desktop.png`, `directory-desktop-light.png`, `directory-mobile-dark.png`, `profile-privacy-desktop.png`, `public-map-light.png`, `public-map-mobile-dark.png`.

## Yang masih perlu disiapkan sebelum produksi

- Isi kontak penanggung jawab data dan tinjau teks kebijakan privasi oleh pengurus.
- Isi URL/key tile dan atribusi sesuai penyedia/paket; verifikasi tile nyata dengan konfigurasi produksi.
- Konfigurasikan pengiriman email produksi. Alur email diuji dengan notification fake; SMTP produksi tidak dihubungi.
- Jalankan migrasi/seeder wilayah dan build pada lingkungan tujuan. Demo hanya untuk pengembangan, dan kredensial demo tidak untuk produksi.
- Tidak ada deployment, integrasi Event/RSVP, lowongan, donasi, chat, feed, OTP/notifikasi WhatsApp, alamat rumah, atau kecamatan baru yang dibuat.

## Catatan audit ReUI

1. Instalasi UI: memakai komponen ReUI/shadcn yang sudah ada; tidak memasang item registry baru.
2. Motion: tidak menambah animasi masuk; Leaflet menghormati preferensi reduced motion.
3. States: kosong dengan aksi, Skeleton loading, dan error dengan Coba lagi disediakan pada region data terkait.
4. Checks: C1–C4, audit checklist, typecheck/lint, dan screenshot light/dark diperiksa.
5. Adaptasi: wizard berupa Card di halaman portal agar formulir panjang mudah diakses; tidak menambah komponen modal/stepper baru. Tile memakai konfigurasi kosong sampai pengurus menyiapkan penyedia.
