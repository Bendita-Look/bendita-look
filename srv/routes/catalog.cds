using {apps.dflc.benditalook.entities as entities} from '../../db/entities';

@path    : '/service/Catalog'
@requires: 'any'
service Catalog {

    @readonly
    entity Categories      as
        projection on entities.Categories {
            ID,
            Name,
            Description,
            Products
        }
        where
            Active = true;

    @readonly
    entity Products        as
        projection on entities.Products {
            ID,
            Name,
            Description,
            Price,
            Featured,
            Category,
            Colors,
            Images,
            Variants,
            createdAt
        }
        where
            Active = true;

    @readonly
    entity ProductColors   as projection on entities.ProductColors;

    @readonly
    entity ProductImages   as projection on entities.ProductImages;

    @readonly
    entity ProductVariants as projection on entities.ProductVariants excluding {
        StockOnEdit
    };

    action   SubmitOrder(Order: entities.OrderInput)              returns entities.SubmitOrderResult;

    function TrackOrder(Number: Integer, AccessCode: String(32)) returns entities.TrackedOrder;

    function StoreInfo()                                          returns entities.StoreInfo;

    function ActivePromotions()                                   returns many entities.ActivePromotion;

    action   QuoteOrder(Items: many entities.OrderItemInput,
                        CouponCode: String(20))                   returns entities.OrderQuote;

}
