const Joi = require('joi');

const requestReturnSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({ reason: Joi.string().allow('', null).max(1000).optional() }),
};

const idOnly = { params: Joi.object({ id: Joi.string().required() }) };

module.exports = { requestReturnSchema, idOnly };
