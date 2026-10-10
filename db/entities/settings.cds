namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity StoreSettings : cuid, managed {
    StoreName          : String(80) @mandatory;
    Whatsapp           : String(20);
    ContactEmail       : String(120);
    Instagram          : String(60);
    NotificationEmails : String(500);
}
