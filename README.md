# Bendita Look - CAP

Backend da loja Bendita Look (SAP CAP + TypeScript). O catálogo é público; a gestão de produtos, pedidos e backups exige a role `Admin`.

## Serviços

| Serviço | Caminho | Acesso | Conteúdo |
|---|---|---|---|
| `Catalog` | `/service/Catalog` | Público | Categorias, produtos, cores, fotos, estoque, `SubmitOrder`, `TrackOrder` |
| `BenditaLook` | `/service/BenditaLook` | Role `Admin` | CRUD com draft de categorias, produtos e backups, pedidos, `ChangeOrderStatus`, `ExportBackup` |

## Fluxo do pedido

1. A cliente envia o carrinho com os dados de contato (`SubmitOrder`), sem cadastro.
2. O estoque é reservado na mesma transação; se algum item não tiver estoque, nada é gravado.
3. É enviado um email para a cliente com cópia para `ADMIN_EMAILS`, com o link de acompanhamento (`STORE_URL#/order/<número>/<código>`).
4. O admin altera o status: `NEW → IN_SERVICE → COMPLETED`, ou `CANCELLED` a partir de `NEW`/`IN_SERVICE`, o que devolve o estoque. Cada mudança envia email para a cliente.

Envios de pedido são limitados a 10 por IP a cada 15 minutos (`srv/constants/order-limits.ts`).

### Estoque durante a edição do produto

Ao editar um produto (draft), o estoque de cada variação é guardado em `StockOnEdit`. Na ativação, o sistema aplica apenas a diferença que o admin digitou sobre o estoque atual, preservando as reservas feitas por pedidos durante a edição.

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
| `ADMIN_EMAILS` | Emails que recebem cópia dos novos pedidos (separados por vírgula) |
| `STORE_URL` | URL do app UI5, usada no link de acompanhamento |
| `STORE_WHATSAPP` | WhatsApp da loja com DDI e DDD (ex.: `5511999999999`) |
| `STORE_NAME` | Nome do remetente dos emails |
| `CORS_ORIGINS` | Origens extras permitidas além de `https://davicastr.github.io` |

## Deploy no BTP Trial

```bash
npm run bd
cf deploy mta_archives/BenditaLook_1.0.0.mtar
cf set-env BenditaLook-srv SMTP_HOST smtp.gmail.com
cf set-env BenditaLook-srv SMTP_USER <email>
cf set-env BenditaLook-srv SMTP_PASSWORD <senha-de-app>
cf set-env BenditaLook-srv ADMIN_EMAILS <emails>
cf set-env BenditaLook-srv STORE_WHATSAPP <numero>
cf restage BenditaLook-srv
```

Depois atribua a role collection `BenditaLook_Admin` ao seu usuário no cockpit (Security > Users).

No trial o HANA Cloud é parado toda noite e precisa ser iniciado novamente no cockpit (ou via `cf`/`btp` CLI) antes de usar o app.
