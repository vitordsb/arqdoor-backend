const SUCCESS_STATUSES = [
  "RECEIVED",
  "RECEIVED_IN_CASH",
  "RECEIVED_MANUALLY",
  "CONFIRMED",
  "DUNNING_RECEIVED",
  "COMPENSATED",
];

const PENDING_STATUSES = [
  "PENDING",
  "AWAITING",
  "IN_ANALYSIS",
  "AWAITING_PAYMENT",
  "WAITING_PAYMENT",
  "AUTHORIZED",
];

const FAILED_STATUSES = [
  "CANCELLED",
  "OVERDUE",
  "REFUNDED",
  "REFUND_REQUESTED",
  "CHARGEBACK_REQUESTED",
  "CHARGEBACK_DISPUTE",
  "AWAITING_CHARGEBACK_REVERSAL",
  "PAYMENT_DELETED",
];

const isPaidStatus = (status) =>
  status && SUCCESS_STATUSES.includes(status.toUpperCase());

const isPendingStatus = (status) =>
  status && PENDING_STATUSES.includes(status.toUpperCase());

const isFailedStatus = (status) =>
  status && FAILED_STATUSES.includes(status.toUpperCase());

module.exports = {
  SUCCESS_STATUSES,
  PENDING_STATUSES,
  FAILED_STATUSES,
  isPaidStatus,
  isPendingStatus,
  isFailedStatus,
};
