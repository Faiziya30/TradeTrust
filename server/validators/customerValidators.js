const Joi = require('joi');

const updateBoosterSchema = {
  params: Joi.object({ id: Joi.string().required() }),
  body: Joi.object({ key: Joi.string().required(), completed: Joi.boolean().required() }),
};

const markNotificationReadSchema = {
  params: Joi.object({ id: Joi.string().required(), notificationId: Joi.string().required() }),
};

const getInstallmentsSchema = {
  params: Joi.object({ id: Joi.string().required() }),
};

module.exports = { updateBoosterSchema, markNotificationReadSchema, getInstallmentsSchema };
