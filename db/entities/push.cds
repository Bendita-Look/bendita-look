namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';
using { apps.dflc.benditalook.entities.Orders } from './orders';

/**
 * Inscrições de Web Push (notificação com o app fechado). Uma linha por
 * navegador/dispositivo do administrador: endpoint + chaves do navegador.
 */
entity PushSubscriptions : cuid, managed {
    Endpoint   : String(500) @mandatory;
    P256dh     : String(200) @mandatory;
    Auth       : String(100) @mandatory;
    UserAgent  : String(255);
    UserName   : String(120);
    Active     : Boolean default true;
}

/**
 * Navegadores de clientes que pedem aviso do status dos pedidos (Web Push, sem login).
 * Um aparelho acompanha vários pedidos; sem nenhum vínculo a linha é removida.
 */
@assert.unique: {Endpoint: [Endpoint]}
entity CustomerPushDevices : cuid, managed {
    Endpoint : String(500) @mandatory;
    P256dh   : String(200) @mandatory;
    Auth     : String(100) @mandatory;
    Locale   : String(10);
    Orders   : Composition of many CustomerPushOrders on Orders.Device = $self;
}

/** Pedido acompanhado por um aparelho de cliente. */
@assert.unique: {DeviceOrder: [Device, Order]}
entity CustomerPushOrders : cuid {
    Device : Association to CustomerPushDevices @mandatory;
    Order  : Association to Orders @mandatory;
}
