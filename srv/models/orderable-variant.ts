import Decimal from 'decimal.js';
import { BaseModel } from './base';

export type OrderableVariantProperties = {
    Id: string;
    Size: string;
    Stock: number;
    ProductId: string;
    ColorId?: string;
    CategoryId?: string;
    ProductName: string;
    ProductActive: boolean;
    Price: Decimal;
    CostPrice: Decimal;
    ColorName?: string;
};

type OrderableVariantRow = {
    ID: string;
    Size: string;
    Stock: number | null;
    ProductId: string;
    ColorId: string | null;
    CategoryId: string | null;
    ProductName: string;
    Price: unknown;
    CostPrice: unknown;
    ProductActive: boolean | null;
    ColorName: string | null;
};

export class OrderableVariantModel extends BaseModel {

    constructor(private readonly properties: OrderableVariantProperties) { super(); }

    public static with(properties: OrderableVariantProperties): OrderableVariantModel {
        return new OrderableVariantModel(properties);
    }

    public static mapModel(Rows: OrderableVariantRow[]): OrderableVariantModel[] {

        return Rows.map((Row) => OrderableVariantModel.with({
            Id: Row.ID,
            Size: Row.Size,
            Stock: Row.Stock ?? 0,
            ProductId: Row.ProductId,
            ColorId: Row.ColorId ?? undefined,
            CategoryId: Row.CategoryId ?? undefined,
            ProductName: Row.ProductName,
            ProductActive: Boolean(Row.ProductName) && Row.ProductActive !== false,
            Price: this.retrieveDecimal(Row.Price),
            CostPrice: this.retrieveDecimal(Row.CostPrice),
            ColorName: Row.ColorName ?? undefined
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Size() { return this.properties.Size; }

    public get Stock() { return this.properties.Stock; }

    public get ProductId() { return this.properties.ProductId; }

    public get ColorId() { return this.properties.ColorId; }

    public get CategoryId() { return this.properties.CategoryId; }

    public get ProductName() { return this.properties.ProductName; }

    public get ProductActive() { return this.properties.ProductActive; }

    public get Price() { return this.properties.Price; }

    public get CostPrice() { return this.properties.CostPrice; }

    public get ColorName() { return this.properties.ColorName; }

    public get Description(): string {

        return [this.properties.ProductName, this.properties.ColorName, this.properties.Size].filter(Boolean).join(' / ');

    }

}
