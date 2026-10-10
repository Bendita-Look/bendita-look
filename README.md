# Bendita Look - CAP

Backend da loja Bendita Look (SAP CAP + TypeScript). O catálogo é público; a gestão de produtos, pedidos e backups exige a role `Admin`.

## Serviços

| Serviço | Caminho | Acesso | Conteúdo |
|---|---|---|---|
| `Catalog` | `/service/Catalog` | Público | Categorias, produtos, cores, fotos, estoque, `SubmitOrder`, `TrackOrder`, `StoreInfo` |
| `BenditaLook` | `/service/BenditaLook` | Role `Admin` | CRUD com draft de categorias, produtos, configurações da loja e backups, pedidos, `ChangeOrderStatus`, `SalesReport`, `ExportBackup` |

## Fluxo do pedido

1. A cliente envia o carrinho com os dados de contato (`SubmitOrder`), sem cadastro.
2. O estoque é reservado na mesma transação; se algum item não tiver estoque, nada é gravado.
3. É enviado um email para a cliente com cópia para os emails de notificação das configurações, com o link de acompanhamento (`STORE_URL#/order/<número>/<código>`).
4. O admin altera o status: `NEW → IN_SERVICE → OUT_FOR_DELIVERY → COMPLETED` (a entrega é opcional; retirada vai direto de `IN_SERVICE` para `COMPLETED`). `OUT_FOR_DELIVERY` exige tipo de entrega (Uber Flash ou entregador local), nome do entregador e, no Uber Flash, a placa. `CANCELLED` pode ser aplicado a qualquer pedido em aberto e devolve o estoque. Cada mudança envia email para a cliente.

## Configurações da loja

Nome, WhatsApp, email de contato, Instagram e emails de notificação ficam na entidade `StoreSettings` (registro único, editado em draft pelo admin). Ela é criada automaticamente no primeiro acesso com os valores das variáveis `STORE_*` e `ADMIN_EMAILS`; depois disso vale o que estiver salvo no admin.

Envios de pedido são limitados a 10 por IP a cada 15 minutos (`srv/constants/order-limits.ts`).

### Estoque durante a edição do produto

Ao editar um produto (draft), o estoque de cada variação é guardado em `StockOnEdit`. Na ativação, o sistema aplica apenas a diferença que o admin digitou sobre o estoque atual, preservando as reservas feitas por pedidos durante a edição.

## Idiomas

Mensagens de erro e emails em português (padrão) e inglês (`srv/_i18n`), escolhidos pelo `Accept-Language` da requisição.

## Backup

`ExportBackup` gera um ZIP com `BenditaLook.xlsx` (uma aba por tabela) e as fotos (`<ID>.<extensão>`). Para importar, crie um registro em `Backups` com o ZIP e ative o draft; registros já existentes (mesmo `ID`) são mantidos e o backup importado é removido após a importação.

## Arquitetura

```
srv/
  routes/        *.cds (serviços) + handlers (registro dos eventos)
  controllers/   converte Either em resposta HTTP
  services/      regras de negócio (Either<AbstractError, T>)
  repositories/  acesso ao banco
  models/        modelos de domínio
  factories/     injeção de dependências
  infrastructure/ e-mail, templates, rate limit, service locator
  _i18n/         mensagens (pt / padrão)
```

## Desenvolvimento local

```bash
npm install
cp .env.example .env    # preencha SMTP e emails de administradores
npm run watch           # http://localhost:4004
```

Usuários locais (basic auth): `davi / 123456` (Admin) e `cliente / 123456` (sem role). Exemplos de chamadas em `test/http`.

Sem SMTP configurado, os emails são ignorados com um aviso no log e o pedido segue normalmente.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Servidor de email (Gmail: senha de app) |
| `STORE_URL` | URL do app UI5, usada no link de acompanhamento |
| `STORE_NAME`, `STORE_WHATSAPP`, `STORE_EMAIL`, `STORE_INSTAGRAM`, `ADMIN_EMAILS` | Valores iniciais das configurações da loja (usados só na criação; depois edite pelo admin) |
| `CORS_ORIGINS` | Origens extras permitidas além de `https://davicastr.github.io` |

## Deploy no BTP Trial

```bash
npm run bd
cf deploy mta_archives/BenditaLook_1.0.0.mtar
cf set-env BenditaLook-srv SMTP_HOST smtp.gmail.com
cf set-env BenditaLook-srv SMTP_USER <email>
cf set-env BenditaLook-srv SMTP_PASSWORD <senha-de-app>
cf restage BenditaLook-srv
```

Depois atribua a role collection `BenditaLook_Admin` ao seu usuário no cockpit (Security > Users).

No trial o HANA Cloud é parado toda noite e precisa ser iniciado novamente no cockpit (ou via `cf`/`btp` CLI) antes de usar o app.
