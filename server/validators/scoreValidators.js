const Joi = require('joi');

const realtimeSchema = {
  body: Joi.object({
    cart: Joi.object({ amount: Joi.number().positive().required() }).required(),
    paymentOption: Joi.string().valid('pay_now','installment','pay_later').required(),
  }),
};

module.exports = { realtimeSchema };
