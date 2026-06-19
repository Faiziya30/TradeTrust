const express = require('express');
const request = require('supertest');
const { validate } = require('../middleware/validate');
const Joi = require('joi');
const { expect } = require('chai');

describe('validate middleware', () => {
  let app;
  before(() => {
    app = express();
    app.use(express.json());

    const schema = { body: Joi.object({ name: Joi.string().required() }) };
    app.post('/test', validate(schema), (req, res) => res.json({ ok: true }));
  });

  it('should return 400 for invalid payload', async () => {
    const res = await request(app).post('/test').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message');
  });

  it('should pass valid payload', async () => {
    const res = await request(app).post('/test').send({ name: 'Alice' });
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ ok: true });
  });
});
