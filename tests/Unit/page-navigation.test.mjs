import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldTransitionPage } from '../../resources/js/lib/page-navigation.ts';

const currentUrl = 'https://example.test/dashboard';

await test('normal page navigation enables the page effect', () => {
    assert.equal(
        shouldTransitionPage('/settings/profile', currentUrl, 'get', []),
        true,
    );
});

await test('query changes, hashes, and refreshing the current page do not animate', () => {
    for (const destination of [
        '/dashboard?period=3',
        '/dashboard#revenue',
        '/dashboard',
    ]) {
        assert.equal(
            shouldTransitionPage(destination, currentUrl, 'get', []),
            false,
        );
    }
});

await test('form submissions never animate even if their destination changes', () => {
    for (const method of ['post', 'put', 'patch', 'delete']) {
        assert.equal(
            shouldTransitionPage('/settings/profile', currentUrl, method, []),
            false,
        );
    }
});

await test('partial reloads and external destinations do not animate', () => {
    assert.equal(
        shouldTransitionPage('/settings/profile', currentUrl, 'get', [
            'months',
        ]),
        false,
    );
    assert.equal(
        shouldTransitionPage(
            'https://other.test/settings',
            currentUrl,
            'get',
            [],
        ),
        false,
    );
});
