const { Op, fn, col, where } = require("sequelize");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const PaymentStep = require("../../models/PaymentStep");
const { SUCCESS_STATUSES } = require("../../utils/asaasStatuses");

const hasPaidPaymentForStep = async (stepId, options = {}) => {
  const { transaction, logger } = options;
  const paidWhere = {
    paid_at: { [Op.ne]: null },
    [Op.and]: where(
      fn("UPPER", fn("TRIM", col("status"))),
      { [Op.in]: SUCCESS_STATUSES }
    ),
  };

  const directPaid = await Payment.findOne({
    where: { step_id: stepId, ...paidWhere },
    transaction,
  });
  if (directPaid) return true;

  const paymentSteps = await PaymentStep.findAll({
    where: { step_id: stepId },
    attributes: ["payment_id"],
    raw: true,
    transaction,
  });

  if (!paymentSteps.length) {
    if (logger) {
      const directNonFinal = await Payment.findOne({
        where: {
          step_id: stepId,
          paid_at: { [Op.ne]: null },
          status: { [Op.notIn]: SUCCESS_STATUSES },
        },
        transaction,
      });
      if (directNonFinal) {
        logger(
          `[refreshStepFinancialClearanceService] paid_at set but status not final for payment ${directNonFinal.id} (status=${directNonFinal.status})`
        );
      }
    }
    return false;
  }

  const groupedPaymentIds = paymentSteps.map((ps) => ps.payment_id).filter(Boolean);
  if (!groupedPaymentIds.length) return false;

  const groupedPaid = await Payment.findOne({
    where: {
      id: { [Op.in]: groupedPaymentIds },
      ...paidWhere,
    },
    transaction,
  });

  if (groupedPaid) return true;

  if (logger) {
    const groupedNonFinal = await Payment.findOne({
      where: {
        id: { [Op.in]: groupedPaymentIds },
        paid_at: { [Op.ne]: null },
        status: { [Op.notIn]: SUCCESS_STATUSES },
      },
      transaction,
    });
    if (groupedNonFinal) {
      logger(
        `[refreshStepFinancialClearanceService] paid_at set but status not final for payment ${groupedNonFinal.id} (status=${groupedNonFinal.status})`
      );
    }
  }

  return false;
};

const refreshStepFinancialClearanceService = async (stepIds, options = {}) => {
  const { transaction, logger } = options;
  const normalized = Array.from(
    new Set((Array.isArray(stepIds) ? stepIds : [stepIds]).filter(Boolean))
  );

  if (!normalized.length) {
    return { clearedStepIds: [], evaluatedStepIds: [] };
  }

  const clearedStepIds = [];
  for (const stepId of normalized) {
    const hasPaid = await hasPaidPaymentForStep(stepId, { transaction, logger });
    if (hasPaid) clearedStepIds.push(stepId);
  }

  if (clearedStepIds.length > 0) {
    await Step.update(
      {
        is_financially_cleared: true,
        confirm_contractor: true,
      },
      { where: { id: clearedStepIds }, transaction }
    );
  }

  if (logger) {
    logger(
      `[refreshStepFinancialClearanceService] steps=${normalized.join(",")} cleared=${clearedStepIds.join(",")}`
    );
  }

  return { clearedStepIds, evaluatedStepIds: normalized };
};

module.exports = refreshStepFinancialClearanceService;
