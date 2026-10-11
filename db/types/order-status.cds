namespace apps.dflc.benditalook.entities;

type OrderStatus     : String(20) enum {
    New            = 'NEW';
    InService      = 'IN_SERVICE';
    OutForDelivery = 'OUT_FOR_DELIVERY';
    Completed      = 'COMPLETED';
    Cancelled      = 'CANCELLED';
}

type DeliveryType    : String(20) enum {
    UberFlash    = 'UBER_FLASH';
    LocalCourier = 'LOCAL_COURIER';
}

type OrderChannel    : String(10) enum {
    Online = 'ONLINE';
    Store  = 'STORE';
}

type FulfillmentType : String(10) enum {
    Delivery = 'DELIVERY';
    Pickup   = 'PICKUP';
}

type PromotionScope  : String(10) enum {
    AllItems = 'ALL';
    Category = 'CATEGORY';
    Product  = 'PRODUCT';
}

type PromotionReward : String(20) enum {
    PercentDiscount = 'PERCENT';
    FixedDiscount   = 'FIXED';
    Gift            = 'GIFT';
    CheapestFree    = 'CHEAPEST_FREE';
}
