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

const createStepValidator = async (req, res, next) => {
  try {
    const { ticket_id, title, price, start_date, end_date, group_id, groupId } =
      req.body || {};

    const schema = Joi.object({
      ticket_id: Joi.number().integer().required(),
      title: Joi.string().min(3).max(100).required(),
      // permite preço zero para a etapa obrigatória de assinatura
      price: Joi.number().min(0).required(),
      start_date: Joi.date().required().custom(allowStartToday),
      end_date: Joi.date().required().custom(ensureEndAfterStart),
      group_id: Joi.number().integer().allow(null),
      groupId: Joi.number().integer().allow(null),
    });

    const { error, value } = schema.validate({
      ticket_id,
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
            middleware: "createStepValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createStepValidator",
      success: false,
    });
  }
};

module.exports = createStepValidator;
