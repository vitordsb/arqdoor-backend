const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const ServiceProvider = require("../../models/ServiceProvider");
const { SUCCESS_STATUSES, PENDING_STATUSES } = require("../../utils/asaasStatuses");

const safeQuery = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[admin-dashboard] Falha ao carregar ${label}:`, err?.message || err);
    return [];
  }
};

const dashboardController = async (req, res) => {
  try {
    const [tickets, steps, payments, users, providers, conversations] = await Promise.all([
      safeQuery("tickets", () =>
        TicketService.findAll({ order: [["created_at", "DESC"]], raw: true })
      ),
      safeQuery("steps", () => Step.findAll({ raw: true })),
      safeQuery("payments", () =>
        Payment.findAll({ order: [["created_at", "DESC"]], raw: true })
      ),
      safeQuery("users", () =>
        User.findAll({
          attributes: ["id", "name", "type", "perfil_completo", "createdAt", "updatedAt", "email"],
          raw: true,
        })
      ),
      safeQuery("providers", () =>
        ServiceProvider.findAll({
          attributes: ["provider_id", "user_id"],
        })
      ),
      safeQuery("conversations", () =>
        Conversation.findAll({
          order: [["conversation_id", "DESC"]],
          raw: true,
        })
      ),
    ]);

    const ticketsActive = tickets.filter(
      (t) => (t.status || "").toLowerCase() !== "cancelada"
    );

    const providerByUser = Array.isArray(providers)
      ? providers.reduce((acc, p) => {
          acc[p.user_id] = p.provider_id;
          return acc;
        }, {})
      : {};

    const userMap = Array.isArray(users)
      ? users.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {})
      : {};

    const pendingPayments = payments.filter((p) =>
      PENDING_STATUSES.includes((p.status || "").toUpperCase())
    );
    const paidPayments = payments.filter((p) =>
      SUCCESS_STATUSES.includes((p.status || "").toUpperCase())
    );

    const stepsByTicket = steps.reduce((acc, step) => {
      acc[step.ticket_id] = acc[step.ticket_id] || [];
      acc[step.ticket_id].push(step);
      return acc;
    }, {});

    const ticketSummaries = ticketsActive.map((t) => {
      const stepsForTicket = stepsByTicket[t.id] || [];
      const hasPendingPayment = stepsForTicket.some((s) =>
        payments.some(
          (p) =>
            p.step_id === s.id &&
            PENDING_STATUSES.includes((p.status || "").toUpperCase())
        )
      );
      return {
        id: t.id,
        status: t.status,
        conversation_id: t.conversation_id,
        provider_id: t.provider_id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        steps_count: stepsForTicket.length,
        has_pending_payment: hasPendingPayment,
      };
    });

    return res.json({
      code: 200,
      success: true,
      data: {
        tickets: ticketSummaries,
        users,
        conversations: conversations.map((c) => ({
          conversation_id: c.conversation_id,
          user1_id: c.user1_id,
          user2_id: c.user2_id,
          user1_email: userMap[c.user1_id]?.email || null,
          user2_email: userMap[c.user2_id]?.email || null,
          user1_provider_id: providerByUser[c.user1_id] || null,
          user2_provider_id: providerByUser[c.user2_id] || null,
          user1_type: userMap[c.user1_id]?.type || null,
          user2_type: userMap[c.user2_id]?.type || null,
          updatedAt: c.updatedAt,
          createdAt: c.createdAt,
        })),
        payments: {
          pending: pendingPayments.map((p) => ({
            id: p.id,
            step_id: p.step_id,
            ticket_id: p.ticket_id,
            status: p.status,
            amount: p.amount,
            created_at: p.created_at,
          })),
          paid: paidPayments.map((p) => ({
            id: p.id,
            step_id: p.step_id,
            ticket_id: p.ticket_id,
            status: p.status,
            amount: p.amount,
            created_at: p.created_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error("[admin-dashboard] erro inesperado:", error?.message || error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro ao carregar dashboard admin",
    });
  }
};

module.exports = dashboardController;
