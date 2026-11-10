import assert from 'node:assert/strict';
import test from 'node:test';
import { createUnsavedChangesGuard } from '../../resources/js/lib/unsaved-changes.ts';

function navigation(overrides = {}) {
    return {
        detail: {
            visit: {
                url: new URL(
                    'https://example.test/admin/articles?status=draft',
                ),
                method: 'get',
                prefetch: false,
                ...overrides,
            },
        },
        defaultPrevented: false,
        preventDefault() {
            this.defaultPrevented = true;
        },
    };
}

await test('leaving a form waits for a decision without sending a request', () => {
    const changes = [];
    const visits = [];
    const guard = createUnsavedChangesGuard(
        (visit) => changes.push(visit),
        (visit) => visits.push(visit),
    );
    const event = navigation();

    guard.before(event);

    assert.equal(event.defaultPrevented, true);
    assert.deepEqual(changes, [event.detail.visit]);
    assert.deepEqual(visits, []);
});

await test('continuing to edit discards the pending navigation', () => {
    const visits = [];
    const changes = [];
    const guard = createUnsavedChangesGuard(
        (visit) => changes.push(visit),
        (visit) => visits.push(visit),
    );
    guard.before(navigation());

    guard.cancel();
    guard.confirm();

    assert.equal(changes.at(-1), null);
    assert.deepEqual(visits, []);
});

await test('confirming resumes the original destination and options exactly once', () => {
    const visits = [];
    const guard = createUnsavedChangesGuard(
        () => {},
        (visit) => visits.push(visit),
    );
    const event = navigation({
        preserveScroll: true,
        replace: true,
        headers: { 'X-Context': 'editor' },
        onSuccess: () => {},
    });
    guard.before(event);

    guard.confirm();
    guard.confirm();

    assert.deepEqual(visits, [event.detail.visit]);
    assert.equal(visits[0], event.detail.visit);
});

await test('only the confirmed request bypasses the guard', () => {
    let resumed;
    const guard = createUnsavedChangesGuard(
        () => {},
        (visit) => {
            resumed = navigation(visit);
            guard.before(resumed);
        },
    );
    guard.before(navigation());

    guard.confirm();
    const next = navigation();
    guard.before(next);

    assert.equal(resumed.defaultPrevented, false);
    assert.equal(next.defaultPrevented, true);
});

await test('a failed navigation keeps later changes protected', () => {
    const guard = createUnsavedChangesGuard(
        () => {},
        () => {
            throw new Error('Navigation failed');
        },
    );
    guard.before(navigation());

    assert.throws(() => guard.confirm(), /Navigation failed/);
    const next = navigation();
    guard.before(next);

    assert.equal(next.defaultPrevented, true);
});

await test('form submissions and prefetches do not open the dialog', () => {
    const changes = [];
    const guard = createUnsavedChangesGuard(
        (visit) => changes.push(visit),
        () => {},
    );

    for (const options of [
        { method: 'post' },
        { method: 'put' },
        { method: 'patch' },
        { method: 'delete' },
        { prefetch: true },
    ]) {
        const event = navigation(options);
        guard.before(event);
        assert.equal(event.defaultPrevented, false);
    }

    assert.deepEqual(changes, []);
});
