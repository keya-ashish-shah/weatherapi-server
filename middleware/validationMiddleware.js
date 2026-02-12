const Joi = require("joi");

function formatJoiErrors(error) {
  return error.details.map(d => d.message).join(", ");
}

function validateRegister(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required",
    }), 
    email: Joi.string().email().lowercase().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    dob: Joi.string() 
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .custom((value, helpers) => {
        const parts = value.split("-").map(Number); 
        if (parts.length !== 3) return helpers.message("Date of birth must be in YYYY-MM-DD format");
        const [y, m, d] = parts;
        const currentYear = new Date().getFullYear();
        if (y === 0) return helpers.message("Year cannot be 0000");
        if (y < 1900 || y > currentYear) return helpers.message(`Year must be between 1900 and ${currentYear}`);
        const date = new Date(y, m - 1, d);
        if (Number.isNaN(date.getTime())) return helpers.message("Date of birth is not a valid calendar date");
        if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) {
          return helpers.message("Date of birth is not a valid calendar date");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date.getTime() > today.getTime()) return helpers.message("Date of birth cannot be in the future");
        return value;
      })
      .messages({
        "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
        "any.required": "Date of birth is required",
      }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, convert: true, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: formatJoiErrors(error) });
  }

  req.body = value;
  next();
}

function validateLogin(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false, convert: true, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: formatJoiErrors(error) });
  }

  req.body = value;
  next();
}

function validateWeather(req, res, next) {
  const source = req.method === "GET" ? req.query : req.body;

  const schema = Joi.object({
    city: Joi.string().trim().min(1).messages({ "string.min": "City must not be empty" }),
    latitude: Joi.number().min(-90).max(90).messages({
      "number.base": "Latitude must be a number",
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
    }),
    longitude: Joi.number().min(-180).max(180).messages({
      "number.base": "Longitude must be a number",
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
    }),
  })
    .or("city", "latitude") 
    .and("latitude", "longitude") 
    .messages({
      "object.missing": "Provide either a city or a pair of latitude and longitude",
      "object.and": "Latitude and longitude must be provided together",
    });

  const { error, value } = schema.validate(source, { abortEarly: false, convert: true, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: formatJoiErrors(error) });
  }

  if (req.method === "GET") {
    req.query = value;
  } else {
    req.body = value;
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateWeather,
};
 