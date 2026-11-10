import assert from 'node:assert/strict';
import test from 'node:test';
import { slugify, readingMinutes } from '../../resources/js/lib/articles.ts';
await test('slugify normalizes accents and separators and bounds the result', () => {
    assert.equal(
        slugify('  Kabar Santri: Pendidikan & Adab!  '),
        'kabar-santri-pendidikan-adab',
    );
    assert.equal(slugify('Édukasi'), 'edukasi');
    assert.equal(slugify('---'), '');
    assert.ok(slugify('a'.repeat(300)).length <= 240);
});
await test('reading estimate ignores markup and rounds up at 200 words', () => {
    assert.equal(readingMinutes(''), 1);
    assert.equal(readingMinutes('<p>Berita santri</p>'), 1);
    assert.equal(readingMinutes('<p>' + 'santri '.repeat(201) + '</p>'), 2);
});
