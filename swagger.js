const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Minha API",
      version: "1.0.0",
      description: "Documentação da API gerada automaticamente com Swagger",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              maxLength: 100,
              example: "João Vitor",
            },
            email: {
              type: "string",
              maxLength: 100,
              example: "joao@email.com",
            },
            password: {
              type: "string",
              example: "12345678",
            },
            cpf: {
              type: "string",
              pattern: "^[0-9]{11}$",
              example: "12345678900",
            },
            cnpj: {
              type: "string",
              pattern: "^[0-9]{11}$",
              example: "12345678900",
            },
            birth: {
              type: "date",
              example: "2006-04-18",
            },
            gender: {
              type: "string",
              enum: ["Masculino", "Feminino", "Prefiro não dizer"],
              example: "Masculino",
            },
            type: {
              type: "string",
              enum: ["contratante", "prestador"],
              example: "prestador",
            },
            termos_aceitos: {
              type: "boolean",
              example: true,
            },
            is_email_verified: {
              type: "boolean",
              example: false,
            },
            perfil_completo: {
              type: "boolean",
              example: false,
            },
          },
          required: ["name", "email", "password", "type"],
        },
        UserInput: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "João Vitor",
            },
            email: {
              type: "string",
              example: "joao@email.com",
            },
            password: {
              type: "string",
              example: "senha123",
            },
            cpf: {
              type: "string",
              example: "12345678900",
            },
            cnpj: {
              type: "string",
              pattern: "^[0-9]{11}$",
              example: "12345678900",
            },
            birth: {
              type: "date",
              example: "2006-04-18",
            },
            gender: {
              type: "string",
              enum: ["Masculino", "Feminino", "Prefiro não dizer"],
              example: "Masculino",
            },
            type: {
              type: "string",
              enum: ["contratante", "prestador"],
              example: "contratante",
            },
            termos_aceitos: {
              type: "boolean",
              example: true,
            },
          },
          required: ["name", "email", "password", "type"],
        },
        ServiceProvider: {
          type: "object",
          properties: {
            provider_id: {
              type: "integer",
              example: 1,
            },
            user_id: {
              type: "integer",
              example: 5,
            },
            profession: {
              type: "string",
              maxLength: 100,
              example: "Eletricista",
            },
            views_profile: {
              type: "integer",
              example: 42,
            },
            about: {
              type: "string",
              example:
                "Profissional com 10 anos de experiência em serviços elétricos residenciais.",
            },
            rating_mid: {
              type: "number",
              format: "float",
              example: 4.5,
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T10:00:00Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T12:00:00Z",
            },
          },
          required: ["user_id", "profession"],
        },
        ServiceProviderInput: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              example: 1,
            },
            profession: {
              type: "string",
              example: "Eletricista",
            },
            about: {
              type: "string",
              example: "Profissional com experiência em serviços residenciais.",
            },
          },
          required: ["profession"],
        },
        Demand: {
          type: "object",
          properties: {
            id_demand: {
              type: "integer",
              example: 1,
            },
            id_user: {
              type: "integer",
              example: 3,
            },
            title: {
              type: "string",
              example: "Conserto de torneira com vazamento",
            },
            description: {
              type: "string",
              example:
                "Preciso de um encanador para consertar uma torneira que está vazando na cozinha.",
            },
            price: {
              type: "number",
              format: "float",
              example: 120.0,
            },
            status: {
              type: "string",
              enum: ["pendente", "em andamento", "concluída", "cancelada"],
              example: "pendente",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T10:00:00Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T12:00:00Z",
            },
          },
          required: ["id_user", "title", "price"],
        },

        DemandInput: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "Conserto de torneira com vazamento",
            },
            description: {
              type: "string",
              example:
                "Preciso de um encanador para consertar uma torneira que está vazando na cozinha.",
            },
            price: {
              type: "number",
              format: "float",
              example: 120.0,
            },
          },
          required: ["title", "price"],
        },
        ServiceFreelancer: {
          type: "object",
          properties: {
            id_serviceFreelancer: {
              type: "integer",
              example: 1,
            },
            id_provider: {
              type: "integer",
              example: 5,
            },
            title: {
              type: "string",
              maxLength: 255,
              example: "Instalação de ventilador de teto",
            },
            description: {
              type: "string",
              example:
                "Faço instalação de ventiladores de teto em residências e escritórios.",
            },
            price: {
              type: "number",
              format: "float",
              example: 180.0,
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T10:00:00Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-30T12:00:00Z",
            },
          },
          required: ["id_provider", "title", "price"],
        },

        ServiceFreelancerInput: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "Instalação de ventilador de teto",
            },
            description: {
              type: "string",
              example:
                "Faço instalação de ventiladores de teto em residências e escritórios.",
            },
            price: {
              type: "number",
              format: "float",
              example: 180.0,
            },
          },
          required: ["title", "price"],
        },
        LocationUser: {
          type: "object",
          properties: {
            cep: {
              type: "string",
              example: "12345678",
            },
            state: {
              type: "string",
              example: "SP",
            },
            city: {
              type: "string",
              example: "São Paulo",
            },
            neighborhood: {
              type: "string",
              example: "Centro",
            },
            street: {
              type: "string",
              example: "Rua das Flores",
            },
            number: {
              type: "string",
              example: "123A",
            },
            typeLocation: {
              type: "string",
              example: "Residencial",
            },
          },
        },
        Message: {
          type: "object",
          properties: {
            message_id: {
              type: "integer",
              example: 1,
            },
            conversation_id: {
              type: "integer",
              example: 10,
            },
            sender_id: {
              type: "integer",
              example: 5,
            },
            content: {
              type: "string",
              example: "Olá, tudo bem?",
            },
          },
        },
        Conversation: {
          type: "object",
          properties: {
            conversation_id: {
              type: "integer",
              example: 1,
            },
            user1_id: {
              type: "integer",
              example: 3,
            },
            user2_id: {
              type: "integer",
              example: 5,
            },
            is_negotiation: {
              type: "boolean",
              example: false,
            },
          },
          required: ["user1_id", "user2_id"],
        },
        TicketService: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            conversation_id: {
              type: "integer",
              example: 10,
            },
            provider_id: {
              type: "integer",
              example: 5,
            },
            status: {
              type: "string",
              enum: ["pendente", "em andamento", "concluída", "cancelada"],
              example: "pendente",
            },
            total_price: {
              type: "number",
              format: "double",
              example: 120.5,
            },
            signature: {
              type: "boolean",
              example: false,
            },
            payment: {
              type: "boolean",
              example: false,
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T15:30:00Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T16:00:00Z",
            },
          },
          required: ["conversation_id", "provider_id"],
        },
        Step: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            ticket_id: {
              type: "integer",
              example: 3,
            },
            status: {
              type: "string",
              example: ["Pendente", "Concluido", "Recusado"],
            },
            signature: {
              type: "boolean",
              example: true,
            },
            signatureUpdateAt: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T15:30:00Z",
            },
            title: {
              type: "string",
              example: "Instalação do ventilador de teto",
            },
            price: {
              type: "number",
              format: "double",
              example: 150.0,
            },
            confirm_freelancer: {
              type: "boolean",
              example: false,
            },
            confirm_freelancerAt: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T15:30:00Z",
            },
            confirm_contractor: {
              type: "boolean",
              example: false,
            },
            start_date: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T15:30:00Z",
            },
            end_date: {
              type: "string",
              format: "date-time",
              example: "2025-08-20T15:30:00Z",
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T15:30:00Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-08-17T16:00:00Z",
            },
          },
          required: [
            "ticket_id",
            "title",
            "price",
            "confirm_freelancer",
            "confirm_contractor",
          ],
        },
        Attachment: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID único do anexo",
              example: 1,
            },
            ticket_id: {
              type: "integer",
              description: "ID do ticket relacionado",
              example: 12,
            },
            pdf_path: {
              type: "string",
              description: "Caminho do arquivo PDF salvo",
              example: "uploads/pdfs/proposta123.pdf",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Data em que o PDF foi anexado",
              example: "2025-08-22T10:30:00.000Z",
            },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            step_id: { type: "integer", example: 4 },
            ticket_id: { type: "integer", example: 12 },
            contractor_id: { type: "integer", example: 2 },
            provider_id: { type: "integer", example: 8 },
            amount: { type: "number", format: "double", example: 750.5 },
            currency: { type: "string", example: "BRL" },
            method: { type: "string", example: "PIX" },
            status: {
              type: "string",
              example: "PENDING",
              description: "Status sincronizado com o Asaas",
            },
            asaas_payment_id: {
              type: "string",
              example: "pay_000012345678",
            },
            asaas_invoice_url: {
              type: "string",
              format: "uri",
              example: "https://www.asaas.com/i/pay_000012345678",
            },
            pix_payload: {
              type: "string",
              description: "Texto copia e cola",
            },
            pix_image: {
              type: "string",
              description: "QR Code Base64",
            },
            pix_expires_at: {
              type: "string",
              format: "date-time",
              example: "2025-02-01T12:00:00Z",
            },
            due_date: {
              type: "string",
              format: "date",
              example: "2025-02-01",
            },
            paid_at: {
              type: "string",
              format: "date-time",
              example: "2025-02-02T14:30:00Z",
            },
            last_event: {
              type: "string",
              example: "PAYMENT_CREATED",
            },
            attempt: {
              type: "integer",
              example: 2,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        PaymentCreateRequest: {
          type: "object",
          properties: {
            description: {
              type: "string",
              maxLength: 255,
              example: "Pagamento da etapa de layout",
            },
          },
        },
        PaymentPixSuccessResponse: {
          type: "object",
          properties: {
            code: { type: "integer", example: 201 },
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Cobrança PIX gerada com sucesso",
            },
            data: {
              type: "object",
              properties: {
                payment_id: { type: "integer", example: 52 },
                asaas_payment_id: {
                  type: "string",
                  example: "pay_000012345678",
                },
                status: { type: "string", example: "PENDING" },
                amount: { type: "number", format: "double", example: 750.5 },
                step_id: { type: "integer", example: 4 },
                ticket_id: { type: "integer", example: 12 },
                attempt: { type: "integer", example: 1 },
                invoice_url: {
                  type: "string",
                  example: "https://www.asaas.com/i/pay_000012345678",
                },
                pix: {
                  type: "object",
                  properties: {
                    copy_and_paste: {
                      type: "string",
                      example: "00020101021226880014br.gov.bcb.pix...",
                    },
                    qr_code_image: {
                      type: "string",
                      description: "Imagem base64 do QR Code",
                    },
                    expires_at: {
                      type: "string",
                      format: "date-time",
                      example: "2025-02-01T12:00:00Z",
                    },
                  },
                },
              },
            },
          },
        },
        PaymentHistoryResponse: {
          type: "object",
          properties: {
            code: { type: "integer", example: 200 },
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Histórico de pagamentos encontrado",
            },
            data: {
              type: "object",
              properties: {
                step_id: { type: "integer", example: 4 },
                ticket_id: { type: "integer", example: 12 },
                payments: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Payment" },
                },
                summary: {
                  type: "object",
                  properties: {
                    total_attempts: { type: "integer", example: 3 },
                    paid_attempts: { type: "integer", example: 1 },
                    has_successful_payment: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
        },
        PaymentWebhookPayload: {
          type: "object",
          properties: {
            event: {
              type: "string",
              example: "PAYMENT_CONFIRMED",
            },
            payment: {
              type: "object",
              description: "Dados enviados pelo Asaas",
            },
          },
          required: ["event", "payment"],
        },
      },

      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routers/*js"], // Caminho dos arquivos que têm comentários Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
