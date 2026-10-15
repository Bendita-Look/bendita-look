namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';
using {apps.dflc.benditalook.entities as entities} from './catalog';

entity StockEntries : cuid, managed {
    Note          : String(255);
    TotalQuantity : Integer;
    TotalCost     : Decimal(15, 2);
    Items         : Composition of many StockEntryItems
                        on Items.Entry = $self;
}

entity StockEntryItems : cuid {
    Entry       : Association to StockEntries;
    Variant     : Association to entities.ProductVariants;
    Product     : Association to entities.Products;
    ProductName : String(120);
    ColorName   : String(40);
    Size        : String(10);
    Quantity    : Integer;
    UnitCost    : Decimal(15, 2);
    TotalCost   : Decimal(15, 2);
}
