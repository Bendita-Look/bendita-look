namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';

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
