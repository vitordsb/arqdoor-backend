# ArqDoor backend – visão geral de rotas e funções

Backend em Node/Express + Sequelize (MySQL). Ponto de entrada: `src/server.js`. Variáveis críticas: `DB_*`, `SECRET`, `GOOGLE_CLIENT_ID`, `ENABLE_DB_SYNC` (dev).

## Infra
- `src/server.js`: sobe Express, CORS, static `/uploads`, Swagger em `/doc`, sync opcional do Sequelize, cria admin se não existir.
- `src/database/config.js`: conecta no MySQL, opcional sync (ENABLE_DB_SYNC/ENABLE_DB_SYNC_ALTER).
- `src/middlewares/validators/authToken.js`: valida JWT Bearer para rotas protegidas.

## Autenticação (`/auth`)
- `POST /auth/login`: email+senha, retorna JWT (`loginUserController` / `loginUserService`).
- `POST /auth/register`: cria usuário com validação (usado pelo front legado; front atual usa `/users`).
- `POST /auth/google`: recebe `idToken` ou `accessToken`, opcional `type` (contratante/prestador) e `mode` (login/register). Verifica token Google, cria/loga usuário. Se `mode=register` e usuário já existe → 409; se criar conta → 201 pede login; login normal → 200 com JWT. Implementação em `googleAuthService.js`.

## Usuários (`/users`)
- `POST /users`: cria usuário com validação Joi (`createUserValidation`), hash de senha, e cria `ServiceProvider` se `type=prestador`.
- `GET /users`: lista usuários.
- `GET /users/:id`: busca por id.
- `PUT /users/:id`: atualiza (com validação).
- `DELETE /users/:id`: remove.
- `GET /users/images/:id`: imagens do usuário.

## Prestadores/Serviços
- `routerProvider` (`/providers`): CRUD de prestador, views, ratings (like/avaliar/consultar).
- `routerServiceFreelancer` (`/servicesfreelancer`): CRUD de serviços vinculados ao prestador.

## Demandas (`/demands`)
- CRUD de demandas do cliente (contratante). Protegido por JWT.

## Portfólio (`/portfolio`)
- CRUD de posts de portfólio, likes, comentários, engajamento. Protegido por JWT na maioria das ações.

## Conversas e mensagens
- `routerConversations` (`/conversation`): listar/conversar entre usuários.
- `routerMessage` (`/message`): CRUD de mensagens em conversas.

## Tickets e etapas
- `routerTicket` (`/ticket`): cria ticket a partir de conversa, lê, atualiza, deleta.
- `routerStep` (`/step`): etapas de trabalho (criar/listar/atualizar/deletar/status).
- `routerStepFeedback` (`/stepfeedback`): feedback/issues de etapas.

## Uploads (`/upload` e `/uploads`)
- `POST /upload`: upload de arquivos. `GET /uploads/*`: estático com headers de PDF amigáveis.

## Localização (`/locationuser`)
- CRUD de endereços do usuário (cep, cidade, estado etc.). Protegido por JWT.

## Anexos de ticket (`/attchment`)
- Lista anexos por ticket. Protegido.

## Pagamentos (`/payments`)
- Rotas diversas para cobrança/asaas, webhooks, preferências de pagamento (ver `routerPayment` e controllers em `src/controllers/payment`).

## Admin (`/admin`)
- Rotas administrativas protegidas por `adminAuth` (Basic Auth).

## Models principais
- `User`, `ServiceProvider`, `ServiceFreelancer`, `Demand`, `Portfolio`/likes/comments, `Conversation`, `Message`, `TicketService`, `Step`, `Payment`, `PaymentCustomer`, `TicketAttchment`, etc. Relações definidas nos respectivos models.

## Middlewares e validações
- Validações com Joi em `src/middlewares/validators/...`.
- JWT obrigatório para rotas que usam `authToken` (veja uso nos routers).

## Swagger
- Documentação acessível em `/doc` (gerada de comentários nos routers/controllers).
