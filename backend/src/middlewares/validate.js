// middlewares/validate.js
import ValidationError from "../errors/ValidationError.js";

const validate =
  ({ body, params, query }) =>
  (req, res, next) => {
    const errors = [];

    if (body) {
      const { error } = body.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
      });
      if (error) errors.push(...error.details);
    }

    if (params) {
      const { error } = params.validate(req.params, {
        abortEarly: false,
        allowUnknown: false,
      });
      if (error) errors.push(...error.details);
    }

    if (query) {
      const { error } = query.validate(req.query, {
        abortEarly: false,
        allowUnknown: false,
      });
      if (error) errors.push(...error.details);
    }

    if (errors.length) {
      return next(
        new ValidationError(
          errors.map((d) => ({
            field: d.path.join("."),
            fieldMessage: d.message,
          })),
        ),
      );
    }
    next();
  };

export default validate;
