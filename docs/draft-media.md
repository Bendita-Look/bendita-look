# Imagens (LargeBinary) em entidades com draft

## Sintoma

Ao salvar uma entidade com draft que recebeu uma imagem maior (banner das configurações, fotos de produto), a tela fica carregando por muito tempo e não retorna sucesso nem erro. O `PUT` da imagem no draft funciona; o que trava é o `draftActivate`.

Localmente (SQLite) não acontece; aparece no HANA.

## Causa

No `draftActivate`, o lean draft do CAP lê a linha do draft e faz `UPDATE`/`INSERT` na entidade ativa. Sem configuração, as colunas `cds.LargeBinary` entram nessa leitura e passam como stream pelo Node, de uma tabela para a outra, dentro da mesma transação. Com imagens maiores essa passagem no HANA pode ficar presa e a requisição nunca termina.

## Solução

Ativar no `.cdsrc.json` (ou em `cds` do `package.json`):

```json
{
    "fiori": {
        "move_media_data_in_db": true
    }
}
```

Com a flag, o CAP deixa as colunas `LargeBinary` fora do upsert e, depois dele, copia a mídia do draft para a ativa direto no banco (`UPDATE ... SELECT`), sem passar o conteúdo pelo Node. O código está em `node_modules/@sap/cds/libx/_runtime/fiori/lean-draft.js` (procure por `move_media_data_in_db`).

Junto com a flag:

- declarar os campos como `LargeBinary @stream` com `@Core.MediaType` apontando para o campo do tipo;
- no front, enviar a imagem para o draft (`IsActiveEntity=false`) e só depois ativar, sem disparar a ativação com um `PUT` de mídia ainda em andamento;
- comprimir a imagem no navegador antes de enviar (`ImageCompressor`), para reduzir o tráfego.

## Histórico

O mesmo problema apareceu no Expense Manager (commit `ff538db` do `SAP-CAP-ExpenseManager`, "fix: move draft media to active on draftActivate"). Lá, a primeira tentativa foi enviar a imagem para a entidade ativa depois do `draftActivate`. Isso foi substituído pela flag, que mantém a imagem dentro do draft e permite descartar a alteração.
