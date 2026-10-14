# Bendita Look - CAP

Backend da loja Bendita Look (SAP CAP + TypeScript). O catálogo é público; a gestão de produtos, pedidos e backups exige a role `Admin`.

## Serviços

| Serviço | Caminho | Acesso | Conteúdo |
|---|---|---|---|
| `Catalog` | `/service/Catalog` | Público | Categorias, produtos, cores, fotos, estoque, `SubmitOrder`, `QuoteOrder`, `TrackOrder`, `StoreInfo`, `ActivePromotions` |
| `BenditaLook` | `/service/BenditaLook` | Role `Admin` | CRUD com draft de categorias, produtos, promoções, configurações da loja e backups, pedidos, `ChangeOrderStatus`, `RegisterStoreSale`, `SalesReport`, `ExportBackup` |

## Fluxo do pedido

1. A cliente envia o carrinho com os dados de contato (`SubmitOrder`), sem cadastro, escolhendo entrega (CEP, endereço e número obrigatórios) ou retirada na loja. O valor é recalculado no servidor com promoções e cupom (`QuoteOrder` mostra a prévia).
2. O estoque e o uso do cupom são reservados na mesma transação; se algum item não tiver estoque ou o cupom esgotar, nada é gravado.
3. A cliente recebe um email com as fotos dos itens e o link de acompanhamento (`STORE_URL#/order/<número>/<código>`). Os emails de notificação das configurações recebem um email dedicado com os itens, os dados de contato, o botão "Iniciar atendimento no WhatsApp" (mensagem já preenchida para a cliente) e o link do admin. Cada item guarda o produto e a foto de capa da cor escolhida, usados no acompanhamento, no admin e nos emails.
4. O admin altera o status: `NEW → IN_SERVICE → OUT_FOR_DELIVERY → COMPLETED` (a entrega é opcional; retirada vai direto de `IN_SERVICE` para `COMPLETED`). `OUT_FOR_DELIVERY` exige tipo de entrega (Uber Flash ou entregador local), nome do entregador e, no Uber Flash, a placa. Pedidos de retirada não podem sair para entrega. `CANCELLED` pode ser aplicado a qualquer pedido em aberto e devolve o estoque e o uso do cupom. Cada mudança envia email para a cliente.
5. Vendas da loja física são registradas pelo admin (`RegisterStoreSale`): canal `STORE`, já concluídas, com baixa de estoque. Nome e email da cliente são opcionais; com email, ela recebe um agradecimento com o link da loja.

## Promoções e cupons

Cadastradas pelo admin em `Promotions` (draft). Cada promoção tem período opcional, abrangência (toda a loja, uma categoria ou um produto), condições (quantidade mínima e valor mínimo das peças elegíveis) e benefício:

| Benefício | Efeito |
|---|---|
| `PERCENT` | Desconto percentual sobre as peças elegíveis |
| `FIXED` | Desconto em valor (limitado ao valor elegível) |
| `CHEAPEST_FREE` | A cada `MinQuantity` peças, a mais barata sai grátis (leve 3 pague 2) |
| `GIFT` | Brinde descrito em texto |

Com `CouponCode` a promoção só vale quando a cliente informa o cupom; `MaxUses` limita os usos. `MaxDiscount` limita em R$ o desconto percentual e o leve X pague X-1 (ex.: 10% até R$ 10). Brindes se acumulam; entre os descontos (automáticos e cupom) vale apenas o maior. As datas são avaliadas no fuso `America/Sao_Paulo`.

## Configurações da loja

Nome, WhatsApp, email de contato, Instagram, emails de notificação, endereço de retirada, link da loja (usado nos emails) e a imagem do banner da vitrine (`BannerImage`, pública em `/service/Catalog/StoreBanners(<ID>)/BannerImage` e incluída no backup como `banner.<extensão>`) ficam na entidade `StoreSettings` (registro único, editado em draft pelo admin). Ela é criada automaticamente no primeiro acesso com os valores das variáveis `STORE_*` e `ADMIN_EMAILS`; depois disso vale o que estiver salvo no admin.

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

No trial o HANA Cloud é parado toda noite. Dois workflows cuidam do ambiente:

| Workflow | Quando roda | O que faz |
|---|---|---|
| [Start BTP trial](.github/workflows/start-trial.yml) | 00:01 e 19:00 (Brasília) e sob demanda | Inicia o HANA Cloud, reinicia o `BenditaLook-srv` e confere se o catálogo responde |
| [Setup BTP trial](.github/workflows/setup-trial.yml) | Manual (conta nova ou novo deploy) | Etapas opcionais: build e deploy do MTA, configuração do SMTP e do `STORE_URL`, e atualização do `webapp/config/runtime-config.json` do UI5 (somente `url`, `clientid` e `xsappname` do XSUAA), com commit que publica o GitHub Pages |

| Configuração (Settings > Secrets and variables > Actions) | Tipo | Valor |
|---|---|---|
| `CF_USERNAME` | Secret | Email do usuário do BTP |
| `CF_PASSWORD` | Secret | Senha do usuário do BTP |
| `UI5_REPO_TOKEN` | Secret | Fine-grained token com *Contents: Read and write* no repositório do UI5 |
| `SMTP_PASSWORD` | Secret | Senha de app do Gmail |
| `CF_ORG` | Variable | Org do Cloud Foundry (ex.: `d4e1c97ctrial`) |
| `SMTP_USER` | Variable | Email que envia as mensagens |
| `CF_API` | Variable | Opcional, padrão `https://api.cf.us10-001.hana.ondemand.com` |
| `CF_SPACE` | Variable | Opcional, padrão `dev` |
| `CF_APP` | Variable | Opcional, padrão `BenditaLook-srv` |
| `HANA_INSTANCE` | Variable | Opcional; sem ela o workflow usa a primeira instância `hana-cloud*` do space |
| `SMTP_HOST` / `SMTP_PORT` | Variable | Opcionais, padrão `smtp.gmail.com` / `587` |
| `UAA_INSTANCE` / `UAA_KEY` | Variable | Opcionais, padrão `BenditaLook-uaa` / `BenditaLook-uaa-key` |
| `UI5_REPOSITORY` / `UI5_PAGES_URL` | Variable | Opcionais, padrão `DaviCastr/SAP-UI5-BenditaLook` / `https://davicastr.github.io/SAP-UI5-BenditaLook/` |

Ao recriar a conta trial: crie a instância do SAP HANA Cloud, atualize `CF_ORG` (e `CF_API`, se a região mudar), rode **Setup BTP trial** com todas as etapas e atribua a role collection `BenditaLook_Admin` ao seu usuário no cockpit.

O GitHub desativa workflows agendados em repositórios sem atividade por 60 dias; nesse caso basta reativá-lo na aba Actions.
