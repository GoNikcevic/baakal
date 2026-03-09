const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, request } = require('./helpers');

describe('Health check', () => {
  before(setup);
  after(teardown);

  it('GET /api/health returns ok', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });
});
