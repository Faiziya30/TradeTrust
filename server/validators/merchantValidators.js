const Joi = require('joi');

const performActionSchema = {
  params: Joi.object({ merchantId: Joi.string().required(), customerId: Joi.string().required() }),
  body: Joi.object({ action: Joi.string().valid('approve','require_deposit','hold').required(), reason: Joi.string().allow('', null).optional() }),
};

const notifySchema = {
  params: Joi.object({ merchantId: Joi.string().required(), customerId: Joi.string().required() }),
  body: Joi.object({ message: Joi.string().min(1).max(2000).required() }),
};

module.exports = { performActionSchema, notifySchema };
