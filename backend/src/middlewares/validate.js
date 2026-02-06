// middlewares/validate.js
import ValidationError from "../errors/ValidationError.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path[0],
      message: d.message,
    }));
    return next(new ValidationError(errors));
  }
  next();
};

export default validate;
