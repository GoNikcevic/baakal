const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, request, registerAndLogin } = require('./helpers');

describe('Projects routes', () => {
  let token;
  let otherToken;

  before(async () => {
    await setup();
    ({ token } = await registerAndLogin({ email: 'proj@bakal.test' }));
    ({ token: otherToken } = await registerAndLogin({ email: 'other@bakal.test' }));
  });
  after(teardown);

  describe('POST /api/projects', () => {
    it('creates a project', async () => {
      const res = await request('POST', '/api/projects', {
        token,
        body: { name: 'Test Project', client: 'ClientCo', description: 'A test', color: 'var(--blue)' },
      });
      assert.equal(res.status, 201);
      assert.ok(res.body.id);
      assert.equal(res.body.name, 'Test Project');
    });

    it('rejects empty name', async () => {
      const res = await request('POST', '/api/projects', {
        token,
        body: { name: '', client: 'X' },
      });
      assert.equal(res.status, 400);
    });

    it('rejects unauthenticated request', async () => {
      const res = await request('POST', '/api/projects', {
        body: { name: 'No Auth' },
      });
      assert.equal(res.status, 401);
    });
  });

  describe('GET /api/projects', () => {
    it('lists only own projects', async () => {
      // Create a project for other user
      await request('POST', '/api/projects', {
        token: otherToken,
        body: { name: 'Other Project' },
      });

      const res = await request('GET', '/api/projects', { token });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.projects));
      // Should not include otherToken's project
      const names = res.body.projects.map(p => p.name);
      assert.ok(!names.includes('Other Project'));
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('updates own project', async () => {
      const create = await request('POST', '/api/projects', {
        token,
        body: { name: 'To Update', client: 'OldClient' },
      });
      const res = await request('PATCH', `/api/projects/${create.body.id}`, {
        token,
        body: { client: 'NewClient' },
      });
      assert.equal(res.status, 200);
    });

    it('denies access to other user project', async () => {
      const create = await request('POST', '/api/projects', {
        token,
        body: { name: 'Mine Only' },
      });
      const res = await request('PATCH', `/api/projects/${create.body.id}`, {
        token: otherToken,
        body: { name: 'Hijacked' },
      });
      assert.equal(res.status, 403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('deletes own project', async () => {
      const create = await request('POST', '/api/projects', {
        token,
        body: { name: 'To Delete' },
      });
      const res = await request('DELETE', `/api/projects/${create.body.id}`, { token });
      assert.equal(res.status, 200);
      assert.equal(res.body.deleted, true);
    });

    it('returns 404 for non-existent project', async () => {
      const res = await request('DELETE', '/api/projects/99999', { token });
      assert.equal(res.status, 404);
    });
  });
});
