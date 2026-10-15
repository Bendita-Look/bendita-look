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
    PickupAddress      : String(255);
    StoreUrl           : String(255);
    WhatsappSignature  : String(255);

    @Core.MediaType  : BannerImageType
    BannerImage        : LargeBinary @stream;

    @Core.IsMediaType: true
    BannerImageType    : String(50);
}
