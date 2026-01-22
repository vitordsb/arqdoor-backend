const asaasClient = require("../../config/asaas");
const PaymentCustomer = require("../../models/PaymentCustomer");
const User = require("../../models/User");

const sanitizeDocument = (value) =>
  value ? String(value).replace(/[^0-9]/g, "") : null;

const ensureAsaasCustomerService = async (userId) => {
  const existing = await PaymentCustomer.findOne({ where: { user_id: userId } });

  if (existing && existing.asaas_customer_id) {
    return existing;
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("Usuário não encontrado para criação do cliente Asaas");
  }

  const document = sanitizeDocument(user.cpf || user.cnpj);
  const documentType = user.cpf ? "CPF" : user.cnpj ? "CNPJ" : null;

  if (!document) {
    throw new Error(
      "Usuário não possui CPF/CNPJ cadastrado. Atualize os dados antes de gerar pagamentos."
    );
  }

  const payload = {
    name: user.name,
    email: user.email,
    cpfCnpj: document,
  };

  const response = await asaasClient.post("/customers", payload);
  const customer = response.data;

  if (existing) {
    await existing.update({
      asaas_customer_id: customer.id,
      document_type: documentType,
      document_value: document,
      payload: JSON.stringify(customer),
    });
    return existing;
  }

  return PaymentCustomer.create({
    user_id: user.id,
    asaas_customer_id: customer.id,
    document_type: documentType,
    document_value: document,
    payload: JSON.stringify(customer),
  });
};

module.exports = ensureAsaasCustomerService;
