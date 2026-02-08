const AdditionalPayment = require("../../models/AdditionalPayment");
const TicketService = require("../../models/TicketService");
const Payment = require("../../models/Payment");
const User = require("../../models/User");
const ensureAsaasCustomerService = require("./ensureAsaasCustomerService");
const asaasClient = require("../../config/asaas");
const dayjs = require("dayjs");
const sequelize = require("../../database/config");

const EXPIRATION_MINUTES = 60;

const createAdditionalPaymentAsaas = async (additionalPayment, contractor, method = "PIX") => {
    // 1. Ensure Customer
    const customer = await ensureAsaasCustomerService(contractor.id);

    // 2. Prepare Payload
    const billingType = method === "PIX" ? "PIX" : "UNDEFINED"; // Support only PIX initially as per code pattern or expand
    const dueDate = dayjs().format("YYYY-MM-DD");
    const description = `Adicional: ${additionalPayment.title}`;

    const payload = {
        customer: customer.asaas_customer_id,
        billingType,
        value: Number(additionalPayment.amount),
        dueDate,
        description,
        externalReference: `add-pay-${additionalPayment.id}-ticket-${additionalPayment.ticket_id}`,
    };

    // 3. Call Asaas
    const response = await asaasClient.post("/payments", payload);
    const paymentData = response.data;

    // 4. Get Pix QR Code
    let pixData = null;
    if (method === "PIX") {
        const pixRes = await asaasClient.get(`/payments/${paymentData.id}/pixQrCode`);
        pixData = pixRes.data;
    }

    return { paymentData, pixData };
};

const respondAdditionalPaymentService = async (id, action, data, user) => {
    const transaction = await sequelize.transaction();

    try {
        const additionalPayment = await AdditionalPayment.findByPk(id, { transaction });

        if (!additionalPayment) {
            await transaction.rollback();
            return { code: 404, message: "Cobrança não encontrada.", success: false };
        }

        if (additionalPayment.status !== "PENDING") {
            await transaction.rollback();
            return { code: 400, message: `Cobrança já está ${additionalPayment.status}.`, success: false };
        }

        // Verify User: Must be the CONTRACTOR (client)
        if (additionalPayment.contractor_id !== user.id) {
            await transaction.rollback();
            return { code: 403, message: "Apenas o cliente pode responder a esta cobrança.", success: false };
        }

        if (action === "refuse") {
            if (!data.reason) {
                await transaction.rollback();
                return { code: 400, message: "Motivo da recusa é obrigatório.", success: false };
            }

            await additionalPayment.update({
                status: "REFUSED",
                refusal_reason: data.reason
            }, { transaction });

            await transaction.commit();

            return {
                code: 200,
                message: "Cobrança recusada.",
                success: true,
                data: additionalPayment
            };
        }

        if (action === "accept") {
            // Generate Payment in Asaas
            // We need method from data, default to PIX
            const method = (data.method || "PIX").toUpperCase();

            // This part interacts with external API, ideally should be outside transaction or handle carefully.
            // We will keep inside try/catch but if Asaas fails we rollback DB.

            let asaasResult;
            try {
                asaasResult = await createAdditionalPaymentAsaas(additionalPayment, user, method);
            } catch (asaasError) {
                await transaction.rollback();
                const msg = asaasError?.response?.data?.errors?.[0]?.description || asaasError.message;
                return { code: 400, message: `Erro no Asaas: ${msg}`, success: false };
            }

            const { paymentData, pixData } = asaasResult;

            // Create Payment Record
            const payment = await Payment.create({
                ticket_id: additionalPayment.ticket_id,
                contractor_id: user.id,
                provider_id: additionalPayment.provider_id,
                amount: additionalPayment.amount,
                method,
                status: paymentData.status || "PENDING",
                asaas_payment_id: paymentData.id,
                asaas_invoice_url: paymentData.invoiceUrl,
                checkout_url: paymentData.invoiceUrl,
                pix_payload: pixData?.payload,
                pix_image: pixData?.encodedImage,
                pix_expires_at: pixData?.expirationDate ? dayjs(pixData.expirationDate).toDate() : null,
                description: `Adicional: ${additionalPayment.title}`,
                last_event: "ADDITIONAL_PAYMENT_ACCEPTED",
                additional_payment_id: additionalPayment.id // Link back!
            }, { transaction });

            // Update AdditionalPayment
            await additionalPayment.update({
                status: "ACCEPTED",
                payment_id: payment.id
            }, { transaction });

            await transaction.commit();

            return {
                code: 200,
                message: "Cobrança aceita e pagamento gerado.",
                success: true,
                data: {
                    additional_payment: additionalPayment,
                    payment: payment,
                    pix: method === "PIX" ? {
                        payload: pixData.payload,
                        image: pixData.encodedImage,
                        expires_at: pixData.expirationDate
                    } : null
                }
            };
        }

        await transaction.rollback();
        return { code: 400, message: "Ação inválida. Use 'accept' ou 'refuse'.", success: false };

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Erro em respondAdditionalPaymentService:", error);
        return {
            code: 500,
            message: "Erro interno.",
            success: false,
        };
    }
};

module.exports = respondAdditionalPaymentService;
