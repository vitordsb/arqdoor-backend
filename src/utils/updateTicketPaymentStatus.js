const TicketService = require("../models/TicketService");
const Step = require("../models/Step");
const Payment = require("../models/Payment");
const { isPaidStatus } = require("./asaasStatuses");

const getNormalizedPreference = (ticket) =>
  (ticket?.payment_preference || "at_end").toString().toLowerCase();

const isPayableStep = (step, index) =>
  index !== 0 && Number(step?.price || 0) > 0;

const computeTicketPaymentStatus = async (ticketId) => {
  const ticket = await TicketService.findByPk(ticketId);
  if (!ticket) return null;

  const paymentPreference = getNormalizedPreference(ticket);
  if (paymentPreference === "at_end") {
    if (ticket.payment) return "deposit_paid";

    const signatureStep = await Step.findOne({
      where: { ticket_id: ticket.id },
      order: [["id", "ASC"]],
    });
    if (!signatureStep) return "awaiting_deposit";

    const depositPayment = await Payment.findOne({
      where: { ticket_id: ticket.id, step_id: signatureStep.id },
      order: [["created_at", "DESC"]],
    });
    if (!depositPayment) return "awaiting_deposit";
    return isPaidStatus(depositPayment.status)
      ? "deposit_paid"
      : "deposit_pending";
  }

  const steps = await Step.findAll({
    where: { ticket_id: ticket.id },
    order: [["id", "ASC"]],
  });

  const payableSteps = steps.filter((step, index) => isPayableStep(step, index));
  if (payableSteps.length === 0) return "steps_paid";

  const paidCount = payableSteps.filter((step) => step.is_financially_cleared)
    .length;

  if (paidCount === 0) return "awaiting_steps";
  if (paidCount < payableSteps.length) return "partial_steps";
  return "steps_paid";
};

const updateTicketPaymentStatus = async (ticketId) => {
  const status = await computeTicketPaymentStatus(ticketId);
  if (!status) return null;
  const ticket = await TicketService.findByPk(ticketId);
  if (!ticket) return null;
  if (ticket.payment_status !== status) {
    await ticket.update({ payment_status: status });
  }
  return status;
};

module.exports = {
  computeTicketPaymentStatus,
  updateTicketPaymentStatus,
};
