using {apps.dflc.benditalook.entities as entities} from '../../db/entities';

@path    : '/service/BenditaLook'
@requires: 'Admin'
service BenditaLook {

    @odata.draft.enabled
    entity Categories      as projection on entities.Categories;

    @odata.draft.enabled
    entity Products        as projection on entities.Products;

    entity ProductColors   as projection on entities.ProductColors;

    entity ProductImages   as projection on entities.ProductImages;

    entity ProductVariants as projection on entities.ProductVariants;

    @readonly
    entity Orders          as projection on entities.Orders excluding {
        AccessCode
    };

    @readonly
    entity OrderItems      as projection on entities.OrderItems;

    @readonly
    entity OrderPromotions as projection on entities.OrderPromotions;

    @readonly
    entity OrderReturns    as projection on entities.OrderReturns;

    @readonly
    entity OrderReturnItems as projection on entities.OrderReturnItems;

    @odata.draft.enabled
    entity Promotions      as projection on entities.Promotions;

    @odata.draft.enabled
    entity Backups         as projection on entities.Backups;

    @odata.draft.enabled
    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity StoreSettings   as projection on entities.StoreSettings;

    action ChangeOrderStatus(OrderId: UUID,
                             Status: entities.OrderStatus,
                             Delivery: entities.DeliveryInput)            returns entities.ActionResult;

    action RegisterStoreSale(Sale: entities.StoreSaleInput)                returns entities.SubmitOrderResult;

    action QuoteOrderUpdate(OrderId: UUID,
                            Items: many entities.OrderItemInput)          returns entities.OrderQuote;

    action UpdateOrderItems(OrderId: UUID,
                            Items: many entities.OrderItemInput)          returns entities.OrderQuote;

    action QuoteOrderReturn(OrderId: UUID,
                            Return: entities.ReturnInput)                 returns entities.ReturnQuote;

    action RegisterOrderReturn(OrderId: UUID,
                               Return: entities.ReturnInput)              returns entities.ReturnQuote;

    action ExportBackup()                                                 returns entities.ActionResult;

    function SalesReport(Year: Integer)                                   returns entities.SalesReport;

}
