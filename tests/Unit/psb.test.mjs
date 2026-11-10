import assert from 'node:assert/strict';
import test from 'node:test';
import {
    validateDocument,
    localDateTime,
    dateTime,
    formatAddress,
    toRichText,
} from '../../resources/js/lib/psb.ts';

await test('plain period information keeps line breaks and escapes literal markup in the editor', () => {
    assert.equal(
        toRichText('Syarat & ketentuan\nBawa <KK>'),
        '<p>Syarat &amp; ketentuan</p><p>Bawa &lt;KK&gt;</p>',
    );
    assert.equal(toRichText(null), '');
});

await test('formatted period information and images are preserved when reopening the editor', () => {
    const html =
        '<h2>Informasi</h2><p>Persyaratan</p><img src="/storage/psb/periods/content/poster.png" alt="Poster">';
    assert.equal(toRichText(html), html);
});

await test('structured address includes neighbourhood and administrative region names', () => {
    assert.equal(
        formatAddress({
            address: 'Jalan contoh 12',
            rt: '001',
            rw: '002',
            village: { name: 'BANDAR LOR' },
            district: { name: 'MOJOROTO' },
            city: { name: 'KOTA KEDIRI' },
            province: { name: 'JAWA TIMUR' },
            postal_code: '64114',
        }),
        'Jalan contoh 12, RT 001 / RW 002, BANDAR LOR, MOJOROTO, KOTA KEDIRI, JAWA TIMUR, 64114',
    );
});

await test('legacy address remains readable when regional data has not been filled', () => {
    assert.equal(
        formatAddress({
            address: 'Alamat lama',
            rt: null,
            rw: null,
            province: null,
            city: null,
            district: null,
            village: null,
            postal_code: null,
        }),
        'Alamat lama',
    );
});

await test('document upload accepts the exact 2 MB boundary and refuses oversized PDFs', () => {
    const allowed = new File([new Uint8Array(2 * 1024 * 1024)], 'ijazah.pdf', {
        type: 'application/pdf',
    });
    const oversized = new File(
        [new Uint8Array(2 * 1024 * 1024 + 1)],
        'ijazah.pdf',
        { type: 'application/pdf' },
    );
    assert.equal(validateDocument(allowed, 'ijazah'), null);
    assert.equal(
        validateDocument(oversized, 'ijazah'),
        'Ukuran berkas maksimal 2 MB.',
    );
});

await test('PDFs and photos cannot be swapped and unsupported image formats are refused', () => {
    const pdf = new File(['pdf'], 'kk.pdf', { type: 'application/pdf' });
    const png = new File(['image'], 'photo.png', { type: 'image/png' });
    const svg = new File(['svg'], 'photo.svg', { type: 'image/svg+xml' });
    assert.equal(validateDocument(pdf, 'kartu_keluarga'), null);
    assert.equal(validateDocument(png, 'pas_foto'), null);
    assert.equal(
        validateDocument(pdf, 'pas_foto'),
        'Format berkas tidak sesuai.',
    );
    assert.equal(
        validateDocument(png, 'ijazah'),
        'Format berkas tidak sesuai.',
    );
    assert.equal(
        validateDocument(svg, 'pas_foto'),
        'Format berkas tidak sesuai.',
    );
});

await test('local date inputs use WIB independently of the browser timezone', () => {
    assert.equal(localDateTime('2026-11-03T01:20:00Z'), '2026-11-03T08:20');
    assert.equal(localDateTime(null), '');
    assert.equal(dateTime(null), 'Belum dicatat');
});
