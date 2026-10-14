import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient, VcsError } from '../src/index.js';

function fakeFetch(handler) {
  return async (url, init) => {
    const { status, body } = await handler(url, JSON.parse(init.body), init.headers);
    return { ok: status < 400, status, json: async () => body };
  };
}

test('data calls go through the gateway with the app id', async () => {
  let seen;
  const vcs = createClient({ appId: 'expense-tracker', fetchImpl: fakeFetch((url, body, headers) => { seen = { url, body, headers }; return { status: 200, body: { items: [] } }; }) });
  await vcs.data('expenses').list({ limit: 5 });
  assert.equal(seen.url, '/vcs/data/expenses/list');
  assert.deepEqual(seen.body, { limit: 5 });
  assert.equal(seen.headers['x-vcs-app'], 'expense-tracker');
});

test('denied scopes surface as VcsError with the gateway code', async () => {
  const vcs = createClient({ fetchImpl: fakeFetch(() => ({ status: 403, body: { code: 'SCOPE_DENIED', message: 'payouts:write not approved' } })) });
  await assert.rejects(vcs.data('payouts').create({ amount: 10 }), e => e instanceof VcsError && e.code === 'SCOPE_DENIED' && e.status === 403);
});

test('invalid resource names are rejected before any request', () => {
  const vcs = createClient({ fetchImpl: async () => { throw new Error('should not fetch'); } });
  assert.throws(() => vcs.data('../secrets'), { code: 'BAD_RESOURCE' });
});
