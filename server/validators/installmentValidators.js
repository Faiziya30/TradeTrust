const Joi = require('joi');

const payInstallmentSchema = {
  params: Joi.object({ planId: Joi.string().required() }),
  body: Joi.object({ index: Joi.number().integer().min(0).required() }),
};

module.exports = { payInstallmentSchema };
