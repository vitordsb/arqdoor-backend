const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const Payment = require("../../models/Payment");
const PaymentStep = require("../../models/PaymentStep");
const ensureAsaasCustomerService = require("./ensureAsaasCustomerService");
const asaasClient = require("../../config/asaas");
const { Op } = require("sequelize");
const { isPendingStatus } = require("../../utils/asaasStatuses");

const createGroupedPaymentService = async (stepIds, user, options = {}) => {
  try {
    if (!stepIds || !Array.isArray(stepIds) || stepIds.length === 0) {
      return {
        code: 400,
        success: false,
        message: "É necessário fornecer um array de IDs das etapas.",
      };
    }

    const steps = await Step.findAll({
      where: {
        id: {
          [Op.in]: stepIds,
        },
      },
    });

    if (steps.length !== stepIds.length) {
      return {
        code: 404,
        success: false,
        message: "Uma ou mais etapas não foram encontradas.",
      };
    }

    const ticketId = steps[0].ticket_id;
    const allSameTicket = steps.every((step) => step.ticket_id === ticketId);

    if (!allSameTicket) {
      return {
        code: 400,
        success: false,
        message: "Todas as etapas devem pertencer ao mesmo ticket.",
      };
    }

    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return { code: 404, success: false, message: "Ticket não encontrado." };
    }

    const paymentPreference = (ticket.payment_preference || "at_end")
      .toString()
      .toLowerCase();
    const isCustom = paymentPreference === "custom";
    if (paymentPreference === "at_end") {
      return {
        code: 400,
        success: false,
        message: "Este ticket utiliza depósito em garantia.",
      };
    }

    if (!ticket.allow_grouped_payment && !isCustom) {
      return {
        code: 403,
        success: false,
        message: "O pagamento agrupado não está habilitado para este serviço.",
      };
    }

    if (!isCustom) {
      const invalidSteps = steps.filter(
        (step) => !step.confirm_freelancer || !step.confirm_contractor
      );
      if (invalidSteps.length > 0) {
        return {
          code: 400,
          success: false,
          message:
            "Todas as etapas precisam estar concluídas e aceitas pelo cliente.",
        };
      }
    } else {
      const rejectedSteps = steps.filter(
        (step) => (step.status || "").toString().toLowerCase() === "recusado"
      );
      if (rejectedSteps.length > 0) {
        return {
          code: 400,
          success: false,
          message: "Etapas recusadas não podem ser pagas.",
        };
      }
    }

    const invalidPrice = steps.find((step) => Number(step.price) <= 0);
    if (invalidPrice) {
      return {
        code: 400,
        success: false,
        message: "Não é possível pagar etapas sem valor.",
      };
    }

    const belowMin = steps.find((step) => Number(step.price) < 5);
    if (belowMin) {
      return {
        code: 400,
        success: false,
        message: "O valor mínimo de cada etapa é R$ 5,00.",
      };
    }

    const alreadyPaid = steps.some((step) => step.is_financially_cleared);
    if (alreadyPaid) {
      return {
        code: 400,
        success: false,
        message: "Uma ou mais etapas selecionadas já foram pagas.",
      };
    }

    // validação de um gp de fases
    const groupIds = [
      ...new Set(steps.map((s) => s.group_id).filter((g) => g !== null && g !== undefined)),
    ];

    if (groupIds.length > 1) {
      return {
        code: 400,
        success: false,
        message: "Não é permitido agrupar etapas de grupos diferentes na mesma cobrança.",
      };
    }

    if (groupIds.length === 1) {
      const groupId = groupIds[0];
      const hasUngrouped = steps.some((s) => s.group_id !== groupId);
      if (hasUngrouped) {
        return {
          code: 400,
          success: false,
          message: "Não é permitido misturar etapas de um grupo com etapas sem grupo.",
        };
      }

      const totalStepsInGroup = await Step.count({ where: { ticket_id: ticketId, group_id: groupId } });
      if (steps.length !== totalStepsInGroup) {
        return { code: 400, success: false, message: "É necessário pagar o grupo de etapas completo." };
      }
    }

    const totalAmount = steps.reduce((sum, step) => sum + Number(step.price), 0);

    const pendingGroupedPayments = await Payment.findAll({
      where: {
        ticket_id: ticketId,
        step_id: null,
      },
    });

    for (const p of pendingGroupedPayments) {
      if (isPendingStatus(p.status)) {
        try {
          await asaasClient.delete(`/payments/${p.asaas_payment_id}`);
          await p.update({ status: "CANCELLED", last_event: "CANCELLED_BY_NEW_REQUEST" });
        } catch (err) {
          console.warn(`Falha ao cancelar pagamento agrupado pendente ${p.id}:`, err.message);
        }
      }
    }

    let paymentCustomer;
    try {
      paymentCustomer = await ensureAsaasCustomerService(user.id);
    } catch (err) {
      return {
        code: 400,
        success: false,
        message:
          err?.message ||
          "Cliente não possui cadastro no Asaas. Verifique se o CPF/CNPJ está cadastrado.",
      };
    }

    if (!paymentCustomer?.asaas_customer_id) {
      return {
        code: 400,
        success: false,
        message: "Cliente não possui cadastro no Asaas. Verifique se o CPF/CNPJ está cadastrado.",
      };
    }

    const { method = "PIX", description } = options;

    let billingType = method;
    if (method === "CREDIT_CARD" || method === "DEBIT_CARD") {
      billingType = "UNDEFINED";
    } else if (method === "PIX") {
      billingType = "PIX";
    } else if (method === "BOLETO") {
      billingType = "BOLETO";
    }

    const paymentPayload = {
      customer: paymentCustomer.asaas_customer_id,
      billingType,
      value: totalAmount,
      dueDate: new Date().toISOString().split("T")[0], // Vence hoje
      description: description || `Pagamento referente a ${steps.length} etapas do Ticket #${ticketId}`,
    };

    const asaasResponse = await asaasClient.post("/payments", paymentPayload);

    const asaasData = asaasResponse.data;

    const newPayment = await Payment.create({
      ticket_id: ticketId,
      contractor_id: user.id,
      provider_id: ticket.provider_id,
      amount: totalAmount,
      method: method,
      status: asaasData.status,
      asaas_payment_id: asaasData.id,
      asaas_invoice_url: asaasData.invoiceUrl,
      pix_payload: asaasData.pixQrCodeField,    });

    const paymentStepsData = steps.map((step) => ({
      payment_id: newPayment.id,
      step_id: step.id,
    }));

    await PaymentStep.bulkCreate(paymentStepsData);

    if (method === "PIX") {
      try {
        const qrResponse = await asaasClient.get(`/payments/${asaasData.id}/pixQrCode`);
        newPayment.pix_payload = qrResponse.data.payload;
        newPayment.pix_image = qrResponse.data.encodedImage;
        await newPayment.save();
      } catch (qrError) {
        console.error("Erro ao buscar QR Code PIX:", qrError.message);
      }
    } else if (method === "BOLETO") {
      try {
        const boletoResponse = await asaasClient.get(`/payments/${asaasData.id}/identificationField`);
        newPayment.boleto_barcode = boletoResponse.data.identificationField;
        newPayment.boleto_url = asaasData.bankSlipUrl;
        await newPayment.save();
      } catch (boletoError) {
        console.error("Erro ao buscar linha digitável:", boletoError.message);
      }
    }

    const responseData = newPayment.toJSON();
    responseData.pix = {
      qr_code_image: newPayment.pix_image,
      copy_and_paste: newPayment.pix_payload,
      expires_at: newPayment.pix_expires_at,
    };
    responseData.boleto = {
      digitable_line: newPayment.boleto_barcode,
      pdf_url: newPayment.boleto_url,
      due_date: newPayment.due_date,
    };

    return {
      code: 201,
      success: true,
      message: "Cobrança agrupada gerada com sucesso.",
      data: responseData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = createGroupedPaymentService;


