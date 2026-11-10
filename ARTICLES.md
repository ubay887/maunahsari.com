# Modul Artikel

## Berkas per fase

1. Fondasi data:
    - `app/ArticleStatus.php`.
    - `app/Models/Article.php`, `Category.php`, `Tag.php`, dan relasi di `User.php`.
    - `database/migrations/2026_11_02_012959_create_article_cms_tables.php`.
    - `database/factories/ArticleFactory.php`, `CategoryFactory.php`, `TagFactory.php`.
    - `database/seeders/ArticleSeeder.php`, `DatabaseSeeder.php`.
2. Backend admin:
    - `app/Policies/ArticlePolicy.php`, `config/articles.php`.
    - `app/Actions/Articles/SaveArticle.php`.
    - `app/Services/ArticleAccess.php`, `ArticleHtmlSanitizer.php`.
    - `app/Http/Controllers/Admin/ArticleController.php`, `ArticleStatusController.php`,
      `ArticleImageController.php`, `TaxonomyController.php`.
    - `app/Http/Requests/StoreArticleRequest.php`, `UpdateArticleRequest.php`,
      `ArticleStatusRequest.php`, `ArticleImageRequest.php`, `TaxonomyRequest.php`.
    - `routes/articles.php`, pemuatan route di `routes/web.php`.
    - `composer.json`/`composer.lock` untuk HTML Purifier.
3. UI admin dan komponen bersama:
    - `resources/js/pages/admin/articles/index.tsx`, `create.tsx`, `edit.tsx`,
      `article-form.tsx`, `taxonomies.tsx`.
    - `resources/js/components/rich-text-editor.tsx`, `confirm-delete-dialog.tsx`,
      `article-page-error.tsx`, `app-sidebar.tsx`.
    - `resources/js/components/ui/alert-dialog.tsx`, `textarea.tsx`.
    - `resources/js/hooks/use-article-page-state.ts`, `resources/js/types/article.ts`.
    - `resources/js/lib/articles.ts`, `article-content-styles.ts`.
    - `app/Http/Middleware/HandleInertiaRequests.php` untuk capability CMS dan flash.
    - `package.json`/`pnpm-lock.yaml` untuk TipTap.
4. Publik dan distribusi:
    - `app/Http/Controllers/ArticleController.php`, `ArticleSyndicationController.php`.
    - `app/Services/ArticleSyndication.php`.
    - `app/Console/Commands/PublishScheduledArticles.php`, `routes/console.php`.
    - `resources/js/pages/articles/index.tsx`, `show.tsx`.
    - `resources/js/components/article-card.tsx`, `article-content.tsx`.
    - `resources/js/layouts/public-layout.tsx`, pemilihan layout di `resources/js/app.tsx`.
    - Route publik ditambahkan di `routes/articles.php`.
5. Tes dan kualitas:
    - `tests/Feature/ArticleModelTest.php`, `AdminArticleTest.php`, `PublicArticleTest.php`.
    - `tests/Unit/articles.test.mjs`.
    - Script tes Node di `package.json` dan integrasi `composer ci:check` di `composer.json`.
    - `.env.example` dan panduan `ARTICLES.md`.

Wayfinder juga diregenerasi pada `resources/js/actions`, `resources/js/routes`, dan
`resources/js/wayfinder` (direktori hasil generate yang sudah diabaikan Git).

## Menjalankan secara lokal

```sh
composer install
pnpm install --frozen-lockfile
php artisan migrate --no-interaction
php artisan db:seed --no-interaction
php artisan storage:link --no-interaction
npm run build
composer run dev
```

`DatabaseSeeder` menjalankan `AlumniRegionSeeder`, `DemoUserSeeder`, `ProgramSeeder`,
`RegistrationPeriodSeeder`, `ArticleSeeder`, dan `EventSeeder` setelah dataset wilayah
Laravolt. Data demo (akun, event, dan pendaftar PSB) hanya dibuat di environment
`local`/`testing`; program, periode PSB, dan artikel berasal dari konten situs resmi
`maunahsari.com` dan ikut dibuat di environment lain.

`ProgramSeeder` memuat empat program (Bil-Hifdhi, Bin-Nadhor, Qira'ah Sab'ah, Riyadloh)
beserta deskripsi resminya. `RegistrationPeriodSeeder` memuat periode PSB 2026/2027
lengkap dengan tautan rincian biaya, narahubung WhatsApp putra/putri, catatan alur dan
syarat pendaftaran, serta delapan kuota program (termasuk kuota resmi Riyadloh: lima
santri putra dan 25 santri putri). Kuota program selain Riyadloh memakai angka awal yang
dapat disesuaikan pengurus melalui CMS.

`ArticleSeeder` memuat lima artikel awal dari situs resmi (pendaftaran, sejarah
pesantren, pengasuh, program dan kegiatan, serta narahubung) beserta empat kategori dan
empat tag. Seeder ini memakai akun admin pertama yang tersedia sebagai penulis; bila
belum ada admin, artikel dilewati sehingga jalankan `app:make-admin` lebih dahulu. Artikel
yang sudah ada tidak diganti agar suntingan pengurus tetap utuh, dan seeder aman
dijalankan berulang. Untuk menjalankan seeder artikel sendiri, gunakan
`php artisan db:seed --class=ArticleSeeder --no-interaction` setelah akun admin tersedia.

`storage:link` wajib agar cover dan gambar konten pada disk `public` dapat diakses.
Cover disimpan di `articles/`; gambar editor di `articles/content/`.
Cover lama dihapus saat diganti/dilepas, dan cover artikel dihapus pada `forceDelete()`.
Hapus dari UI memakai soft delete; cover tetap disimpan sampai penghapusan permanen.
Gambar editor tidak ikut dihapus otomatis karena bisa dipakai oleh lebih dari satu artikel.

## Akses CMS

Hak CMS memakai role (`spatie/laravel-permission`), bukan daftar email di environment.
Role staf: `admin`, `editor`, dan `author`. Berikan role dengan:

```bash
php artisan app:make-admin email@domain-anda.id --role=admin
php artisan app:make-admin editor@domain-anda.id --role=editor
php artisan app:make-admin penulis@domain-anda.id --role=author
```

Perintah ini membuat akun (secara interaktif) atau mengubah akun yang sudah ada menjadi
staf dengan satu role. Role dibuat oleh `RoleSeeder` (`php artisan db:seed --class=RoleSeeder`).

- `admin`: semua modul, termasuk artikel, kategori/tag, event, PSB, santri, dan alumni.
- `editor`: mengelola seluruh artikel serta kategori/tag, dan dapat menerbitkan atau menjadwalkan.
- `author`: hanya mengelola artikel miliknya dan menyimpan draf/arsip.

Akun staf tanpa role tidak mendapat akses ke modul mana pun. Pengguna lain tidak dapat
masuk ke CMS. Di `local`/`testing`, `php artisan db:seed` membuat akun demo
`admin@example.test` (password `password`) dengan role `admin`.

## Route dan publikasi

- Admin: `/admin/articles`, kategori/tag: `/admin/articles/taxonomies`.
- Publik: `/artikel`, `/artikel/{slug}`.
- RSS: `/artikel/feed` (50 artikel terbaru), sitemap: `/sitemap.xml`.
- Pratinjau: tombol di halaman edit, membutuhkan Policy dan memakai `noindex,nofollow`.

Semua tautan aplikasi frontend memakai Wayfinder. Regenerasi setelah mengubah route:

```sh
php artisan wayfinder:generate --with-form --no-interaction
```

Command `articles:publish-scheduled` berjalan setiap menit melalui scheduler dan aman
dijalankan berulang. Secara lokal gunakan `php artisan schedule:work`; di server jalankan
`php artisan schedule:run` setiap menit lewat cron. Jadwal dari form mengikuti zona waktu
perangkat dan dikirim sebagai ISO 8601; waktu ditampilkan mengikuti zona waktu pembaca.
Scope publik juga menyertakan artikel scheduled yang sudah waktunya, sehingga artikel
tetap tampil jika scheduler sedikit terlambat.

HTML disanitasi server oleh HTML Purifier dengan whitelist. Tampilan publik mengubah
tag yang diizinkan menjadi elemen React. Metadata diatur melalui Inertia Head; SSR tidak
diaktifkan sesuai lingkup tugas, sehingga crawler yang tidak menjalankan JavaScript
mungkin tidak membaca metadata sosial tersebut.

## Verifikasi

```sh
php vendor/bin/pint --format agent
php vendor/bin/phpstan analyse --no-progress --memory-limit=1G
php artisan test --compact
npm run check
npm run types:check
npm run test:unit
npm run build
```

Pengujian artikel berada di `ArticleModelTest`, `AdminArticleTest`, `PublicArticleTest`,
dan `tests/Unit/articles.test.mjs`. `composer ci:check` juga menjalankan tes Node.
Editor reusable: `resources/js/components/rich-text-editor.tsx`, menerima URL upload
sebagai prop agar dapat digunakan oleh modul lain. Grid dan filter memakai komponen
ReUI yang telah terpasang.
