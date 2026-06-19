const Joi = require('joi');

const thresholdSchema = {
  params: Joi.object({ merchantId: Joi.string().required() }),
  body: Joi.object({ threshold: Joi.number().required() }),
};

module.exports = { thresholdSchema };
