import { Order, Orders } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { OrderStatus } from '@/constants/order-status';
import { AuditProperties, BaseModel } from './base';
import { OrderItemModel } from './order-item';

export type OrderProperties = AuditProperties & {
    Id: string;
    Number: number;
    AccessCode: string;
    Status: OrderStatus;
    CustomerName: string;
    CustomerEmail: string;
    CustomerPhone: string;
    Address?: string;
    District?: string;
    City?: string;
    ZipCode?: string;
    Notes?: string;
    TotalAmount: Decimal;
    Items: OrderItemModel[];
};

export class OrderModel extends BaseModel {

    constructor(private readonly properties: OrderProperties) { super(); }

    public static with(properties: OrderProperties): OrderModel {
        return new OrderModel(properties);
    }

    public static mapModel(Orders: Orders): OrderModel[] {

        return Orders.map((Order: Order) => OrderModel.with({
            Id: Order.ID as string,
            Number: Order.Number as number,
            AccessCode: Order.AccessCode as string,
            Status: Order.Status as OrderStatus,
            CustomerName: Order.CustomerName as string,
            CustomerEmail: Order.CustomerEmail as string,
            CustomerPhone: Order.CustomerPhone as string,
            Address: Order.Address ?? undefined,
            District: Order.District ?? undefined,
            City: Order.City ?? undefined,
            ZipCode: Order.ZipCode ?? undefined,
            Notes: Order.Notes ?? undefined,
            TotalAmount: this.retrieveDecimal(Order.TotalAmount),
            Items: OrderItemModel.mapModel(Order.Items ?? []),
            ...this.retrieveAudit(Order)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Number() { return this.properties.Number; }

    public get AccessCode() { return this.properties.AccessCode; }

    public get Status() { return this.properties.Status; }

    public get CustomerName() { return this.properties.CustomerName; }

    public get CustomerEmail() { return this.properties.CustomerEmail; }

    public get CustomerPhone() { return this.properties.CustomerPhone; }

    public get Address() { return this.properties.Address; }

    public get District() { return this.properties.District; }

    public get City() { return this.properties.City; }

    public get ZipCode() { return this.properties.ZipCode; }

    public get Notes() { return this.properties.Notes; }

    public get TotalAmount() { return this.properties.TotalAmount; }

    public get Items() { return this.properties.Items; }

    public get CreatedAt() { return this.properties.CreatedAt; }

    public get ModifiedAt() { return this.properties.ModifiedAt; }

    public withStatus(Status: OrderStatus): OrderModel {

        return OrderModel.with({ ...this.properties, Status });

    }

    public toEntityObject(): Order {

        return this.cleanEntity({
            ID: this.properties.Id,
            Number: this.properties.Number,
            AccessCode: this.properties.AccessCode,
            Status: this.properties.Status,
            CustomerName: this.properties.CustomerName,
            CustomerEmail: this.properties.CustomerEmail,
            CustomerPhone: this.properties.CustomerPhone,
            Address: this.properties.Address,
            District: this.properties.District,
            City: this.properties.City,
            ZipCode: this.properties.ZipCode,
            Notes: this.properties.Notes,
            TotalAmount: this.properties.TotalAmount.toNumber(),
            ...this.auditEntityObject(this.properties)
        });

    }

}
