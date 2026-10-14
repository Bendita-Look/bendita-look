import { OrderReturn, OrderReturns } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { AuditProperties, BaseModel } from './base';
import { OrderReturnItemModel } from './order-return-item';

export type OrderReturnProperties = AuditProperties & {
    Id: string;
    OrderId: string;
    Reason?: string;
    RefundAmount: Decimal;
    ExchangeAmount: Decimal;
    BalanceAmount: Decimal;
    Items: OrderReturnItemModel[];
};

export class OrderReturnModel extends BaseModel {

    constructor(private readonly properties: OrderReturnProperties) { super(); }

    public static with(properties: OrderReturnProperties): OrderReturnModel {
        return new OrderReturnModel(properties);
    }

    public static mapModel(Returns: OrderReturns): OrderReturnModel[] {

        return Returns.map((Return: OrderReturn) => OrderReturnModel.with({
            Id: Return.ID as string,
            OrderId: Return.Order_ID as string,
            Reason: Return.Reason ?? undefined,
            RefundAmount: this.retrieveDecimal(Return.RefundAmount),
            ExchangeAmount: this.retrieveDecimal(Return.ExchangeAmount),
            BalanceAmount: this.retrieveDecimal(Return.BalanceAmount),
            Items: OrderReturnItemModel.mapModel(Return.Items ?? []),
            ...this.retrieveAudit(Return)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get OrderId() { return this.properties.OrderId; }

    public get Reason() { return this.properties.Reason; }

    public get RefundAmount() { return this.properties.RefundAmount; }

    public get ExchangeAmount() { return this.properties.ExchangeAmount; }

    public get BalanceAmount() { return this.properties.BalanceAmount; }

    public get Items() { return this.properties.Items; }

    public get ReturnedItems() { return this.properties.Items.filter((Item) => Item.IsReturned); }

    public get Replacements() { return this.properties.Items.filter((Item) => !Item.IsReturned); }

    public get CreatedAt() { return this.properties.CreatedAt; }

    public toEntityObject(): OrderReturn {

        return this.cleanEntity({
            ID: this.properties.Id,
            Order_ID: this.properties.OrderId,
            Reason: this.properties.Reason,
            RefundAmount: this.properties.RefundAmount.toNumber(),
            ExchangeAmount: this.properties.ExchangeAmount.toNumber(),
            BalanceAmount: this.properties.BalanceAmount.toNumber(),
            ...this.auditEntityObject(this.properties)
        });

    }

}
