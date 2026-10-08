namespace apps.dflc.benditalook.entities;

type ActionResult {
    success : Boolean;
    data    : LargeString;
}

type OrderItemInput {
    Variant_ID : UUID;
    Quantity   : Integer;
}

type OrderInput {
    CustomerName  : String(120);
    CustomerEmail : String(120);
    CustomerPhone : String(20);
    Address       : String(200);
    District      : String(80);
    City          : String(80);
    ZipCode       : String(10);
    Notes         : String(500);
    Items         : many OrderItemInput;
}

type SubmitOrderResult {
    Number     : Integer;
    AccessCode : String(32);
}

type TrackedOrderItem {
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitPrice   : Decimal(15, 2);
    TotalPrice  : Decimal(15, 2);
}

type TrackedOrder {
    Number       : Integer;
    Status       : String(20);
    CustomerName : String(120);
    TotalAmount  : Decimal(15, 2);
    createdAt    : Timestamp;
    modifiedAt   : Timestamp;
    Items        : many TrackedOrderItem;
}
