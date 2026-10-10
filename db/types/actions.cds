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

type DeliveryInput {
    DeliveryType  : String(20);
    CourierName   : String(120);
    VehiclePlate  : String(10);
    DeliveryNotes : String(255);
}

type StoreInfo {
    StoreName    : String(80);
    Whatsapp     : String(20);
    ContactEmail : String(120);
    Instagram    : String(60);
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
    DeliveryType : String(20);
    CourierName  : String(120);
    VehiclePlate : String(10);
    DeliveryNotes: String(255);
    createdAt    : Timestamp;
    modifiedAt   : Timestamp;
    Items        : many TrackedOrderItem;
}

type MonthlySales {
    Month   : Integer;
    Orders  : Integer;
    Items   : Integer;
    Revenue : Decimal(15, 2);
}

type ProductSales {
    ProductName : String(120);
    Quantity    : Integer;
    Revenue     : Decimal(15, 2);
}

type SalesReport {
    Year            : Integer;
    CompletedOrders : Integer;
    ItemsSold       : Integer;
    Revenue         : Decimal(15, 2);
    AverageTicket   : Decimal(15, 2);
    OpenOrders      : Integer;
    OpenAmount      : Decimal(15, 2);
    CancelledOrders : Integer;
    Months          : many MonthlySales;
    TopProducts     : many ProductSales;
}
