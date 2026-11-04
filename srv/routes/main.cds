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

    entity ProductMeasurements as projection on entities.ProductMeasurements;

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

    @readonly
    entity StockEntries    as projection on entities.StockEntries;

    @readonly
    entity StockEntryItems as projection on entities.StockEntryItems;

    @odata.draft.enabled
    entity Promotions      as projection on entities.Promotions;

    @odata.draft.enabled
    entity Backups         as projection on entities.Backups;

    @odata.draft.enabled
    @Capabilities.InsertRestrictions.Insertable: false
    @Capabilities.DeleteRestrictions.Deletable : false
    entity StoreSettings   as projection on entities.StoreSettings;

    @odata.draft.enabled
    entity StorePolicies   as projection on entities.StorePolicies;

    entity Subscribers     as projection on entities.Subscribers;

    @odata.draft.enabled
    entity NewsletterCampaigns as projection on entities.NewsletterCampaigns;

    action ChangeOrderStatus(OrderId: UUID,
                             Status: entities.OrderStatus,
                             Delivery: entities.DeliveryInput)            returns entities.ActionResult;

    action DeleteOrders(OrderIds: many UUID,
                        RestoreStock: Boolean)                            returns entities.ActionResult;

    action RegisterStoreSale(Sale: entities.StoreSaleInput)                returns entities.SubmitOrderResult;

    action QuoteOrderUpdate(OrderId: UUID,
                            Change: entities.OrderChangeInput)            returns entities.OrderQuote;

    action UpdateOrderItems(OrderId: UUID,
                            Change: entities.OrderChangeInput)            returns entities.OrderQuote;

    action QuoteOrderReturn(OrderId: UUID,
                            Return: entities.ReturnInput)                 returns entities.ReturnQuote;

    action RegisterOrderReturn(OrderId: UUID,
                               Return: entities.ReturnInput)              returns entities.ReturnQuote;

    action RegisterStockEntry(Entry: entities.StockEntryInput)            returns entities.ActionResult;

    action DeleteStockEntry(EntryId: UUID)                                 returns entities.ActionResult;

    action ExportBackup()                                                 returns entities.ActionResult;

    action SaveEmailServer(Server: entities.EmailServerInput)             returns entities.ActionResult;

    action RemoveEmailServer()                                            returns entities.ActionResult;

    action SendTestEmail(Recipient: String(120))                          returns entities.ActionResult;

    action SendNewsletter(Campaign: entities.NewsletterSendInput)         returns entities.NewsletterSendResult;

    @readonly
    entity PushSubscriptions as projection on entities.PushSubscriptions;

    function PushPublicKey()                                                returns String(500);

    action SubscribePush(Endpoint: String(500),
                         P256dh: String(200),
                         Auth: String(100),
                         UserAgent: String(255))                             returns entities.ActionResult;

    action UnsubscribePush(Endpoint: String(500))                          returns entities.ActionResult;

    action SendPushTest()                                                  returns entities.ActionResult;

    function EmailServer()                                                returns entities.EmailServerInfo;

    function OrderTrackingUrl(OrderId: UUID)                              returns String(500);

    function SalesReport(Year: Integer)                                   returns entities.SalesReport;

}
