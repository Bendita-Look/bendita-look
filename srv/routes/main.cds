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

    @odata.draft.enabled
    entity Backups         as projection on entities.Backups;

    action ChangeOrderStatus(OrderId: UUID, Status: entities.OrderStatus) returns entities.ActionResult;

    action ExportBackup()                                                 returns entities.ActionResult;

    function SalesReport(Year: Integer)                                   returns entities.SalesReport;

}
