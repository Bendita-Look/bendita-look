namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Categories : cuid, managed {
    Name        : String(60) @mandatory;
    Description : String(255);
    Active      : Boolean default true;
    Products    : Association to many Products
                      on Products.Category = $self;
}

entity Products : cuid, managed {
    Name        : String(120)              @mandatory;
    Description : String(1000);
    Price       : Decimal(15, 2)           @mandatory;
    CostPrice   : Decimal(15, 2) default 0;
    Active      : Boolean default true;
    Featured    : Boolean default false;
    Category    : Association to Categories @mandatory;
    Colors      : Composition of many ProductColors
                      on Colors.Product = $self;
    Images      : Composition of many ProductImages
                      on Images.Product = $self;
    Variants    : Composition of many ProductVariants
                      on Variants.Product = $self;
}

entity ProductColors : cuid {
    Product : Association to Products;
    Name    : String(40) @mandatory;
    HexCode : String(7);
}

entity ProductImages : cuid {
    Product   : Association to Products;
    Color     : Association to ProductColors;
    SortOrder : Integer default 0;

    @Core.MediaType  : ImageType
    Image     : LargeBinary @stream;

    @Core.IsMediaType: true
    ImageType : String(50);
}

entity ProductVariants : cuid {
    Product     : Association to Products;
    Color       : Association to ProductColors;
    Size        : String(10) @mandatory;
    Stock       : Integer default 0;
    StockOnEdit : Integer;
}
