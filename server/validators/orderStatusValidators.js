const Joi = require('joi');

const orderStatusSchema = {
  params: Joi.object({ orderId: Joi.string().required() }),
  body: Joi.object({ status: Joi.string().valid('returned','chargeback','failed','paid').required(), reason: Joi.string().allow('', null).optional() }),
};

module.exports = { orderStatusSchema };
