import { OrderItem, OrderItems } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { BaseModel } from './base';

export type OrderItemProperties = {
    Id: string;
    OrderId: string;
    VariantId: string;
    ProductName: string;
    ColorName?: string;
    Size: string;
    Quantity: number;
    UnitPrice: Decimal;
    TotalPrice: Decimal;
};

export class OrderItemModel extends BaseModel {

    constructor(private readonly properties: OrderItemProperties) { super(); }

    public static with(properties: OrderItemProperties): OrderItemModel {
        return new OrderItemModel(properties);
    }

    public static mapModel(Items: OrderItems): OrderItemModel[] {

        return Items.map((Item: OrderItem) => OrderItemModel.with({
            Id: Item.ID as string,
            OrderId: Item.Order_ID as string,
            VariantId: Item.Variant_ID as string,
            ProductName: Item.ProductName as string,
            ColorName: Item.ColorName ?? undefined,
            Size: Item.Size as string,
            Quantity: Item.Quantity ?? 0,
            UnitPrice: this.retrieveDecimal(Item.UnitPrice),
            TotalPrice: this.retrieveDecimal(Item.TotalPrice)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get OrderId() { return this.properties.OrderId; }

    public get VariantId() { return this.properties.VariantId; }

    public get ProductName() { return this.properties.ProductName; }

    public get ColorName() { return this.properties.ColorName; }

    public get Size() { return this.properties.Size; }

    public get Quantity() { return this.properties.Quantity; }

    public get UnitPrice() { return this.properties.UnitPrice; }

    public get TotalPrice() { return this.properties.TotalPrice; }

    public toEntityObject(): OrderItem {

        return this.cleanEntity({
            ID: this.properties.Id,
            Order_ID: this.properties.OrderId,
            Variant_ID: this.properties.VariantId,
            ProductName: this.properties.ProductName,
            ColorName: this.properties.ColorName,
            Size: this.properties.Size,
            Quantity: this.properties.Quantity,
            UnitPrice: this.properties.UnitPrice.toNumber(),
            TotalPrice: this.properties.TotalPrice.toNumber()
        });

    }

}
