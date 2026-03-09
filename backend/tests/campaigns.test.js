const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, request, registerAndLogin } = require('./helpers');

describe('Campaigns routes', () => {
  let token;
  let otherToken;

  before(async () => {
    await setup();
    // Register "other" first so they become admin; "camp" is a regular client
    ({ token: otherToken } = await registerAndLogin({ email: 'camp-other@bakal.test' }));
    ({ token } = await registerAndLogin({ email: 'camp@bakal.test' }));
  });
  after(teardown);

  describe('POST /api/campaigns', () => {
    it('creates a campaign', async () => {
      const res = await request('POST', '/api/campaigns', {
        token,
        body: {
          name: 'DRH PME Lyon',
          client: 'TestCo',
          channel: 'email',
          sector: 'Formation',
          position: 'DRH',
          size: '11-50',
          zone: 'Lyon',
          tone: 'Pro décontracté',
          angle: 'Douleur client',
        },
      });
      assert.equal(res.status, 201);
      assert.ok(res.body.id);
      assert.equal(res.body.name, 'DRH PME Lyon');
    });

    it('creates a campaign with sequence', async () => {
      const res = await request('POST', '/api/campaigns', {
        token,
        body: {
          name: 'With Sequence',
          client: 'TestCo',
          channel: 'multi',
          sequence: [
            { step: 1, type: 'email', label: 'E1', subject: 'Hello', body: 'Content here' },
            { step: 2, type: 'linkedin', label: 'LK1', body: 'LinkedIn message' },
          ],
        },
      });
      assert.equal(res.status, 201);
    });
  });

  describe('GET /api/campaigns', () => {
    it('lists own campaigns', async () => {
      const res = await request('GET', '/api/campaigns', { token });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.campaigns));
      assert.ok(res.body.campaigns.length >= 2);
    });

    it('does not show other users campaigns', async () => {
      await request('POST', '/api/campaigns', {
        token: otherToken,
        body: { name: 'Secret Campaign', channel: 'email', client: 'TestCo' },
      });
      const res = await request('GET', '/api/campaigns', { token });
      const names = res.body.campaigns.map(c => c.name);
      assert.ok(!names.includes('Secret Campaign'));
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('returns campaign detail with sequence', async () => {
      const create = await request('POST', '/api/campaigns', {
        token,
        body: { name: 'Detail Test', channel: 'email', client: 'TestCo' },
      });
      const res = await request('GET', `/api/campaigns/${create.body.id}`, { token });
      assert.equal(res.status, 200);
      assert.ok(res.body.campaign);
      assert.ok(Array.isArray(res.body.sequence));
    });

    it('returns 404 for non-existent campaign', async () => {
      const res = await request('GET', '/api/campaigns/99999', { token });
      assert.equal(res.status, 404);
    });

    it('denies access to other user campaign', async () => {
      const create = await request('POST', '/api/campaigns', {
        token: otherToken,
        body: { name: 'Private', channel: 'email', client: 'TestCo' },
      });
      const res = await request('GET', `/api/campaigns/${create.body.id}`, { token });
      assert.equal(res.status, 403);
    });
  });

  describe('PATCH /api/campaigns/:id', () => {
    it('updates own campaign', async () => {
      const create = await request('POST', '/api/campaigns', {
        token,
        body: { name: 'To Patch', channel: 'email', client: 'TestCo' },
      });
      const res = await request('PATCH', `/api/campaigns/${create.body.id}`, {
        token,
        body: { status: 'active' },
      });
      assert.equal(res.status, 200);
    });
  });

  describe('PUT /api/campaigns/:id/sequence', () => {
    it('replaces campaign sequence', async () => {
      const create = await request('POST', '/api/campaigns', {
        token,
        body: { name: 'Seq Replace', channel: 'email', client: 'TestCo' },
      });
      const res = await request('PUT', `/api/campaigns/${create.body.id}/sequence`, {
        token,
        body: {
          sequence: [
            { step: 1, type: 'email', label: 'E1', subject: 'New', body: 'New body' },
          ],
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.sequence.length, 1);
    });
  });
});
