export const ORDER_LIMITS = {
    maxItems: 30,
    maxQuantityPerItem: 20,
    maxOrdersPerWindow: 10,
    maxOrdersPerDelete: 100,
    maxOrdersPerLookup: 50,
    maxOrderLinksPerEmail: 20,
    orderLinksLookbackMonths: 12,
    windowInMinutes: 15
} as const;

// Limite separado do de pedidos: o envio de links dispara e-mails, então não pode virar ferramenta de spam pela loja.
export const ORDER_LINK_LIMITS = { maxRequestsPerWindow: 3, windowInMinutes: 15 } as const;
