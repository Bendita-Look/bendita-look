import { StockEntryItem, StockEntryItems } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { BaseModel } from './base';

export type StockEntryItemProperties = {
    Id: string;
    EntryId: string;
    VariantId: string;
    ProductId: string;
    ProductName: string;
    ColorName?: string;
    Size: string;
    Quantity: number;
    UnitCost: Decimal;
    TotalCost: Decimal;
};

export class StockEntryItemModel extends BaseModel {

    constructor(private readonly properties: StockEntryItemProperties) { super(); }

    public static with(properties: StockEntryItemProperties): StockEntryItemModel {
        return new StockEntryItemModel(properties);
    }

    public static mapModel(Items: StockEntryItems): StockEntryItemModel[] {

        return Items.map((Item: StockEntryItem) => StockEntryItemModel.with({
            Id: Item.ID as string,
            EntryId: Item.Entry_ID as string,
            VariantId: Item.Variant_ID as string,
            ProductId: Item.Product_ID as string,
            ProductName: Item.ProductName as string,
            ColorName: Item.ColorName ?? undefined,
            Size: Item.Size as string,
            Quantity: Item.Quantity ?? 0,
            UnitCost: this.retrieveDecimal(Item.UnitCost),
            TotalCost: this.retrieveDecimal(Item.TotalCost)
        }));

    }

    public get Quantity() { return this.properties.Quantity; }

    public get TotalCost() { return this.properties.TotalCost; }

    public toEntityObject(): StockEntryItem {

        return this.cleanEntity({
            ID: this.properties.Id,
            Entry_ID: this.properties.EntryId,
            Variant_ID: this.properties.VariantId,
            Product_ID: this.properties.ProductId,
            ProductName: this.properties.ProductName,
            ColorName: this.properties.ColorName,
            Size: this.properties.Size,
            Quantity: this.properties.Quantity,
            UnitCost: this.properties.UnitCost.toNumber(),
            TotalCost: this.properties.TotalCost.toNumber()
        });

    }

}
