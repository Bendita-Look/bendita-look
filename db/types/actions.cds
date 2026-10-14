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
    CustomerName    : String(120);
    CustomerEmail   : String(120);
    CustomerPhone   : String(20);
    FulfillmentType : String(10);
    ZipCode         : String(10);
    Address         : String(200);
    AddressNumber   : String(20);
    Complement      : String(80);
    District        : String(80);
    City            : String(80);
    State           : String(2);
    Notes           : String(500);
    CouponCode      : String(20);
    Items           : many OrderItemInput;
}

type StoreSaleInput {
    CustomerName  : String(120);
    CustomerEmail : String(120);
    CustomerPhone : String(20);
    Notes         : String(500);
    CouponCode    : String(20);
    Items         : many OrderItemInput;
}

type QuoteLine {
    Variant_ID  : UUID;
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitPrice   : Decimal(15, 2);
    TotalPrice  : Decimal(15, 2);
}

type AppliedPromotion {
    PromotionName   : String(120);
    RewardType      : String(20);
    DiscountAmount  : Decimal(15, 2);
    GiftDescription : String(255);
    CouponCode      : String(20);
}

type OrderQuote {
    SubtotalAmount : Decimal(15, 2);
    DiscountAmount : Decimal(15, 2);
    TotalAmount    : Decimal(15, 2);
    CouponCode     : String(20);
    CouponStatus   : String(20);
    CouponMessage  : String(255);
    Lines          : many QuoteLine;
    Promotions     : many AppliedPromotion;
}

type ActivePromotion {
    Name        : String(120);
    Description : String(500);
}

type ReturnItemInput {
    OrderItem_ID : UUID;
    Quantity     : Integer;
    Restock      : Boolean;
}

type ReturnInput {
    Reason       : String(255);
    Items        : many ReturnItemInput;
    Replacements : many OrderItemInput;
}

type ReturnQuote {
    RefundAmount   : Decimal(15, 2);
    ExchangeAmount : Decimal(15, 2);
    BalanceAmount  : Decimal(15, 2);
}

type DeliveryInput {
    DeliveryType  : String(20);
    CourierName   : String(120);
    VehiclePlate  : String(10);
    DeliveryNotes : String(255);
}

type StoreInfo {
    StoreName     : String(80);
    Whatsapp      : String(20);
    ContactEmail  : String(120);
    Instagram     : String(60);
    PickupAddress : String(255);
    StoreUrl      : String(255);
    BannerId      : UUID;
    BannerVersion : String(40);
}

type SubmitOrderResult {
    Number     : Integer;
    AccessCode : String(32);
}

type TrackedOrderItem {
    ProductId   : UUID;
    ImageId     : UUID;
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitPrice   : Decimal(15, 2);
    TotalPrice  : Decimal(15, 2);
}

type TrackedReturnItem {
    Kind        : String(12);
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
}

type TrackedReturn {
    createdAt      : Timestamp;
    RefundAmount   : Decimal(15, 2);
    ExchangeAmount : Decimal(15, 2);
    BalanceAmount  : Decimal(15, 2);
    Items          : many TrackedReturnItem;
}

type TrackedOrder {
    Number          : Integer;
    Status          : String(20);
    CustomerName    : String(120);
    FulfillmentType : String(10);
    SubtotalAmount  : Decimal(15, 2);
    DiscountAmount  : Decimal(15, 2);
    TotalAmount     : Decimal(15, 2);
    CouponCode      : String(20);
    Promotions      : many AppliedPromotion;
    DeliveryType : String(20);
    CourierName  : String(120);
    VehiclePlate : String(10);
    DeliveryNotes: String(255);
    createdAt    : Timestamp;
    modifiedAt   : Timestamp;
    Items        : many TrackedOrderItem;
    Returns      : many TrackedReturn;
}

type MonthlySales {
    Month   : Integer;
    Orders  : Integer;
    Items   : Integer;
    Revenue : Decimal(15, 2);
    Refunds : Decimal(15, 2);
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
    CustomerArrangedDeliveries : Integer;
    GrossRevenue    : Decimal(15, 2);
    ReturnsCount    : Integer;
    ReturnedItems   : Integer;
    RefundedAmount  : Decimal(15, 2);
    ExchangedAmount : Decimal(15, 2);
    Months          : many MonthlySales;
    TopProducts     : many ProductSales;
    TopReturned     : many ProductSales;
}
