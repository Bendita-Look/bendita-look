namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';
using {apps.dflc.benditalook.entities as entities} from './catalog';
using {apps.dflc.benditalook.entities.Promotions} from './promotions';
using {
    apps.dflc.benditalook.entities.OrderStatus,
    apps.dflc.benditalook.entities.DeliveryType,
    apps.dflc.benditalook.entities.OrderChannel,
    apps.dflc.benditalook.entities.FulfillmentType
} from '../types/order-status';

@assert.unique: {Number: [Number]}
entity Orders : cuid, managed {
    Number          : Integer;
    AccessCode      : String(32);
    Status          : OrderStatus default 'NEW';
    Channel         : OrderChannel default 'ONLINE';
    FulfillmentType : FulfillmentType default 'DELIVERY';
    CustomerName    : String(120);
    CustomerEmail   : String(120);
    CustomerPhone   : String(20);
    ZipCode         : String(10);
    Address         : String(200);
    AddressNumber   : String(20);
    Complement      : String(80);
    District        : String(80);
    City            : String(80);
    State           : String(2);
    Notes           : String(500);
    SubtotalAmount  : Decimal(15, 2);
    DiscountAmount  : Decimal(15, 2);
    TotalAmount     : Decimal(15, 2);
    CouponCode      : String(20);
    DeliveryType    : DeliveryType;
    CourierName     : String(120);
    VehiclePlate    : String(10);
    DeliveryNotes   : String(255);
    Items           : Composition of many OrderItems
                          on Items.Order = $self;
    Promotions      : Composition of many OrderPromotions
                          on Promotions.Order = $self;
}

entity OrderItems : cuid {
    Order       : Association to Orders;
    Variant     : Association to entities.ProductVariants;
    Product     : Association to entities.Products;
    ImageId     : UUID;
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitPrice   : Decimal(15, 2);
    TotalPrice  : Decimal(15, 2);
}

entity OrderPromotions : cuid {
    Order           : Association to Orders;
    Promotion       : Association to Promotions;
    PromotionName   : String(120);
    RewardType      : String(20);
    DiscountAmount  : Decimal(15, 2);
    GiftDescription : String(255);
    CouponCode      : String(20);
}
