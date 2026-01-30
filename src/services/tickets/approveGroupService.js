const asaasClient = require("../../config/asaas");
const ensureAsaasCustomerService = require("../payment/ensureAsaasCustomerService");
const dayjs = require("dayjs");

const approveGroupService = async (ticketId, groupId, user) => {
  const transaction = await sequelize.transaction();
  try {
    const ticket = await TicketService.findByPk(ticketId, {
      include: [
        { model: ServiceProvider, as: "provider", include: ["user"] },
        { model: User, as: "contractor" },
      ],
      transaction,
    });

    if (!ticket) throw new Error("Ticket não encontrado.");
    
    // Validar permissão (apenas o contratante aprova)
    if (user.id !== ticket.contractor_id) {
      throw new Error("Apenas o contratante pode aprovar o pagamento do grupo.");
    }

    // Buscar etapas do grupo
    const steps = await Step.findAll({
      where: {
        ticket_id: ticketId,
        group_id: groupId,
      },
      transaction,
    });

    if (!steps.length) throw new Error("Nenhuma etapa encontrada neste grupo.");

    // Validar se todas estão concluídas
    const pendingSteps = steps.filter((s) => s.status !== "Concluido");
    if (pendingSteps.length > 0) {
      throw new Error("Todas as etapas do grupo devem estar concluídas para aprovação.");
    }

    // Calcular total
    const totalAmount = steps.reduce((sum, s) => sum + Number(s.price), 0);
    if (totalAmount <= 0) throw new Error("Valor do grupo inválido.");

    // Garantir cliente Asaas
    let customer;
    try {
      customer = await ensureAsaasCustomerService(user.id);
    } catch (err) {
      throw new Error(`Erro no cadastro Asaas: ${err.message}`);
    }

    // Criar Cobrança no Asaas
    const dueDate = dayjs().add(3, 'day').format("YYYY-MM-DD");
    
    const chargePayload = {
      customer: customer.asaas_customer_id, 
      value: totalAmount,
      billingType: "PIX", // Default inicial
      dueDate: dueDate,
      description: `Pagamento Grupo ${groupId} - Ticket #${ticketId}`,
      externalReference: `TICKET-${ticketId}-GROUP-${groupId}`,
    };

    let charge;
    try {
      const resp = await asaasClient.post("/payments", chargePayload);
      charge = resp.data;
    } catch (apiErr) {
       console.error("Erro API Asaas:", apiErr.response?.data);
       throw new Error("Falha ao criar cobrança no provedor de pagamento.");
    }

    // Obter Payload PIX
    let pixData = null;
    try {
      const pixResp = await asaasClient.get(`/payments/${charge.id}/pixQrCode`);
      pixData = pixResp.data;
    } catch(e) {
      console.warn("Falha ao obter QR Code PIX", e.message);
    }

    // Criar Payment no Banco
    const payment = await Payment.create({
      ticket_id: ticketId,
      contractor_id: ticket.contractor_id,
      provider_id: ticket.provider_id,
      amount: totalAmount,
      asaas_payment_id: charge.id,
      asaas_invoice_url: charge.invoiceUrl,
      pix_payload: pixData?.payload || null, 
      pix_image: pixData?.encodedImage || null,
      status: charge.status || "PENDING",
      method: "PIX", 
      description: `Pagamento Grupo ${groupId} (Etapas: ${steps.length})`,
      step_id: null, 
    }, { transaction });

    // Vincular Steps ao Payment
    const paymentStepsData = steps.map(s => ({
      payment_id: payment.id,
      step_id: s.id
    }));
    
    await PaymentStep.bulkCreate(paymentStepsData, { transaction });

    await transaction.commit();

    return {
      code: 200,
      message: "Grupo aprovado e cobrança gerada com sucesso.",
      success: true,
      data: {
        payment_id: payment.id,
        boleto_url: charge.bankSlipUrl || charge.invoiceUrl,
        pix_qr_code: pixData?.payload,
        pix_image: pixData?.encodedImage,
        invoice_url: charge.invoiceUrl
      }
    };

  } catch (error) {
    await transaction.rollback();
    console.error("Erro em approveGroupService:", error);
    return {
      code: 400,
      message: error.message || "Erro ao aprovar grupo.",
      success: false
    };
  }
};

module.exports = approveGroupService;
