const Joi = require("joi");

function validate(schema) {
  return (req, res, next) => {
    const toValidate = {};
    if (schema.body) toValidate.body = req.body;
    if (schema.params) toValidate.params = req.params;
    if (schema.query) toValidate.query = req.query;

    const combinedSchema = Joi.object(schema).unknown(true);
    const { error } = combinedSchema.validate(toValidate, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details.map(d => d.message).join(", ") });
    }
    next();
  };
}

module.exports = { validate };
