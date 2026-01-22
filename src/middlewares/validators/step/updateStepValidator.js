const Joi = require("joi");

const allowStartToday = (value, helpers) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return helpers.error("date.format");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return helpers.message('"start_date" must be greater or equal to today');
  }
  return value;
};

const ensureEndAfterStart = (value, helpers) => {
  const start = helpers?.state?.ancestors?.[0]?.start_date;
  if (start) {
    const startDate = new Date(start);
    const endDate = new Date(value);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return helpers.error("date.format");
    }
    if (endDate < startDate) {
      return helpers.message('"end_date" must be greater or equal to "start_date"');
    }
  }
  return value;
};

const updateStepValidator = async (req, res, next) => {
  try {
    const { title, price, start_date, end_date, group_id, groupId } =
      req.body || {};

    const schema = Joi.object({
      title: Joi.string().min(3).max(100),
      // aceita zero para manter a etapa de assinatura gratuita
      price: Joi.number().min(0),
      start_date: Joi.date().custom(allowStartToday),
      end_date: Joi.date().custom(ensureEndAfterStart),
      group_id: Joi.number().integer().allow(null),
      groupId: Joi.number().integer().allow(null),
    });
    const { error, value } = schema.validate({
      title,
      price,
      start_date,
      end_date,
      group_id,
      groupId,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.step = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateStepValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateStepValidator",
      success: false,
    });
  }
};

module.exports = updateStepValidator;
