namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';
using {apps.dflc.benditalook.entities as entities} from './catalog';
using {apps.dflc.benditalook.entities.OrderStatus} from '../types/order-status';

@assert.unique: {Number: [Number]}
entity Orders : cuid, managed {
    Number        : Integer;
    AccessCode    : String(32);
    Status        : OrderStatus default 'NEW';
    CustomerName  : String(120) @mandatory;
    CustomerEmail : String(120) @mandatory;
    CustomerPhone : String(20)  @mandatory;
    Address       : String(200);
    District      : String(80);
    City          : String(80);
    ZipCode       : String(10);
    Notes         : String(500);
    TotalAmount   : Decimal(15, 2);
    Items         : Composition of many OrderItems
                        on Items.Order = $self;
}

entity OrderItems : cuid {
    Order       : Association to Orders;
    Variant     : Association to entities.ProductVariants;
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitPrice   : Decimal(15, 2);
    TotalPrice  : Decimal(15, 2);
}
