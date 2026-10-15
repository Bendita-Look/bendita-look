import { OrderReturnItem, OrderReturnItems } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { ReturnItemKind } from '@/constants/order-status';
import { BaseModel } from './base';

export type OrderReturnItemProperties = {
    Id: string;
    ReturnId: string;
    Kind: ReturnItemKind;
    OrderItemId?: string;
    ReplacementId?: string;
    VariantId: string;
    ProductId?: string;
    ImageId?: string;
    ProductName: string;
    ColorName?: string;
    Size: string;
    Quantity: number;
    UnitPrice: Decimal;
    TotalPrice: Decimal;
    UnitCost?: Decimal;
    CategoryName?: string;
    Restock: boolean;
};

export class OrderReturnItemModel extends BaseModel {

    constructor(private readonly properties: OrderReturnItemProperties) { super(); }

    public static with(properties: OrderReturnItemProperties): OrderReturnItemModel {
        return new OrderReturnItemModel(properties);
    }

    public static mapModel(Items: OrderReturnItems): OrderReturnItemModel[] {

        return Items.map((Item: OrderReturnItem) => OrderReturnItemModel.with({
            Id: Item.ID as string,
            ReturnId: Item.Return_ID as string,
            Kind: Item.Kind as ReturnItemKind,
            OrderItemId: Item.OrderItem_ID ?? undefined,
            ReplacementId: Item.Replacement_ID ?? undefined,
            VariantId: Item.Variant_ID as string,
            ProductId: Item.Product_ID ?? undefined,
            ImageId: Item.ImageId ?? undefined,
            ProductName: Item.ProductName as string,
            ColorName: Item.ColorName ?? undefined,
            Size: Item.Size as string,
            Quantity: Item.Quantity ?? 0,
            UnitPrice: this.retrieveDecimal(Item.UnitPrice),
            TotalPrice: this.retrieveDecimal(Item.TotalPrice),
            UnitCost: Item.UnitCost === null || Item.UnitCost === undefined ? undefined : this.retrieveDecimal(Item.UnitCost),
            CategoryName: (Item as OrderReturnItem & { Product?: { Category?: { Name?: string | null } | null } | null }).Product?.Category?.Name ?? undefined,
            Restock: Boolean(Item.Restock)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Kind() { return this.properties.Kind; }

    public get IsReturned() { return this.properties.Kind === ReturnItemKind.Returned; }

    public get OrderItemId() { return this.properties.OrderItemId; }

    public get ReplacementId() { return this.properties.ReplacementId; }

    public get ProductId() { return this.properties.ProductId; }

    public get VariantId() { return this.properties.VariantId; }

    public get ImageId() { return this.properties.ImageId; }

    public get ProductName() { return this.properties.ProductName; }

    public get ColorName() { return this.properties.ColorName; }

    public get Size() { return this.properties.Size; }

    public get Quantity() { return this.properties.Quantity; }

    public get UnitPrice() { return this.properties.UnitPrice; }

    public get TotalPrice() { return this.properties.TotalPrice; }

    public get UnitCost() { return this.properties.UnitCost; }

    public get CategoryName() { return this.properties.CategoryName; }

    public get Restock() { return this.properties.Restock; }

    public toEntityObject(): OrderReturnItem {

        return this.cleanEntity({
            ID: this.properties.Id,
            Return_ID: this.properties.ReturnId,
            Kind: this.properties.Kind,
            OrderItem_ID: this.properties.OrderItemId,
            Replacement_ID: this.properties.ReplacementId,
            Variant_ID: this.properties.VariantId,
            Product_ID: this.properties.ProductId,
            ImageId: this.properties.ImageId,
            ProductName: this.properties.ProductName,
            ColorName: this.properties.ColorName,
            Size: this.properties.Size,
            Quantity: this.properties.Quantity,
            UnitPrice: this.properties.UnitPrice.toNumber(),
            TotalPrice: this.properties.TotalPrice.toNumber(),
            UnitCost: this.properties.UnitCost?.toNumber(),
            Restock: this.properties.Restock
        });

    }

}
