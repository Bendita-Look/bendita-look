namespace apps.dflc.benditalook.entities;

type OrderStatus  : String(20) enum {
    New            = 'NEW';
    InService      = 'IN_SERVICE';
    OutForDelivery = 'OUT_FOR_DELIVERY';
    Completed      = 'COMPLETED';
    Cancelled      = 'CANCELLED';
}

type DeliveryType : String(20) enum {
    UberFlash    = 'UBER_FLASH';
    LocalCourier = 'LOCAL_COURIER';
}
