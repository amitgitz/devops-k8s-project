const request = require('supertest');
const { app, pool } = require('../app');

afterAll(async () => {
    await pool.end();
});

describe('Health Check', () => {
    it('GET /api/health should return status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});

describe('Items API', () => {
    it('POST /api/items should reject empty name', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Name is required');
    });

    it('POST /api/items should reject missing body', async () => {
        const res = await request(app)
            .post('/api/items')
            .send({ name: '' });
        // empty string is falsy so should also be rejected
        expect(res.statusCode).toBe(400);
    });
});
