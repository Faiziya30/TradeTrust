const Joi = require("joi");

const createOrderSchema = {
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          name: Joi.string().optional(),
          price: Joi.number().min(0).required(),
          qty: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    amount: Joi.number().positive().required(),
    merchantId: Joi.string().optional(),
    paymentOption: Joi.string().valid("pay_now", "installment", "pay_later").required(),
    installmentConfig: Joi.object({ count: Joi.number().integer().min(1).max(12) }).optional(),
    payLaterDays: Joi.number().integer().optional(),
  }),
};

module.exports = { createOrderSchema };
