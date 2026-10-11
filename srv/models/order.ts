import { Order, Orders } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { DeliveryType, FulfillmentType, OrderChannel, OrderStatus } from '@/constants/order-status';
import { AuditProperties, BaseModel } from './base';
import { OrderItemModel } from './order-item';
import { OrderPromotionModel } from './order-promotion';

export type OrderDelivery = {
    DeliveryType: DeliveryType;
    CourierName: string;
    VehiclePlate?: string;
    DeliveryNotes?: string;
};

export type OrderAddress = {
    ZipCode?: string;
    Address?: string;
    AddressNumber?: string;
    Complement?: string;
    District?: string;
    City?: string;
    State?: string;
};

export type OrderProperties = AuditProperties & Partial<OrderDelivery> & OrderAddress & {
    Id: string;
    Number: number;
    AccessCode: string;
    Status: OrderStatus;
    Channel: OrderChannel;
    FulfillmentType: FulfillmentType;
    CustomerName?: string;
    CustomerEmail?: string;
    CustomerPhone?: string;
    Notes?: string;
    SubtotalAmount: Decimal;
    DiscountAmount: Decimal;
    TotalAmount: Decimal;
    CouponCode?: string;
    Items: OrderItemModel[];
    Promotions: OrderPromotionModel[];
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
            Channel: (Order.Channel as OrderChannel) ?? OrderChannel.Online,
            FulfillmentType: (Order.FulfillmentType as FulfillmentType) ?? FulfillmentType.Delivery,
            CustomerName: Order.CustomerName ?? undefined,
            CustomerEmail: Order.CustomerEmail ?? undefined,
            CustomerPhone: Order.CustomerPhone ?? undefined,
            ZipCode: Order.ZipCode ?? undefined,
            Address: Order.Address ?? undefined,
            AddressNumber: Order.AddressNumber ?? undefined,
            Complement: Order.Complement ?? undefined,
            District: Order.District ?? undefined,
            City: Order.City ?? undefined,
            State: Order.State ?? undefined,
            Notes: Order.Notes ?? undefined,
            SubtotalAmount: this.retrieveDecimal(Order.SubtotalAmount ?? Order.TotalAmount),
            DiscountAmount: this.retrieveDecimal(Order.DiscountAmount),
            TotalAmount: this.retrieveDecimal(Order.TotalAmount),
            CouponCode: Order.CouponCode ?? undefined,
            DeliveryType: (Order.DeliveryType as DeliveryType) ?? undefined,
            CourierName: Order.CourierName ?? undefined,
            VehiclePlate: Order.VehiclePlate ?? undefined,
            DeliveryNotes: Order.DeliveryNotes ?? undefined,
            Items: OrderItemModel.mapModel(Order.Items ?? []),
            Promotions: OrderPromotionModel.mapModel(Order.Promotions ?? []),
            ...this.retrieveAudit(Order)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Number() { return this.properties.Number; }

    public get AccessCode() { return this.properties.AccessCode; }

    public get Status() { return this.properties.Status; }

    public get Channel() { return this.properties.Channel; }

    public get FulfillmentType() { return this.properties.FulfillmentType; }

    public get IsPickup() { return this.properties.FulfillmentType === FulfillmentType.Pickup; }

    public get CustomerName() { return this.properties.CustomerName; }

    public get CustomerEmail() { return this.properties.CustomerEmail; }

    public get CustomerPhone() { return this.properties.CustomerPhone; }

    public get Notes() { return this.properties.Notes; }

    public get FormattedAddress(): string {

        const sStreet = [this.properties.Address, this.properties.AddressNumber].filter(Boolean).join(', ');
        const sCity = [this.properties.City, this.properties.State].filter(Boolean).join('/');

        return [sStreet, this.properties.Complement, this.properties.District, sCity, this.properties.ZipCode].filter(Boolean).join(' - ');

    }

    public get SubtotalAmount() { return this.properties.SubtotalAmount; }

    public get DiscountAmount() { return this.properties.DiscountAmount; }

    public get TotalAmount() { return this.properties.TotalAmount; }

    public get CouponCode() { return this.properties.CouponCode; }

    public get Items() { return this.properties.Items; }

    public get Promotions() { return this.properties.Promotions; }

    public get DeliveryType() { return this.properties.DeliveryType; }

    public get CourierName() { return this.properties.CourierName; }

    public get VehiclePlate() { return this.properties.VehiclePlate; }

    public get DeliveryNotes() { return this.properties.DeliveryNotes; }

    public get CreatedAt() { return this.properties.CreatedAt; }

    public get ModifiedAt() { return this.properties.ModifiedAt; }

    public withStatus(Status: OrderStatus, Delivery?: OrderDelivery): OrderModel {

        return OrderModel.with({ ...this.properties, ...Delivery, Status });

    }

    public toEntityObject(): Order {

        return this.cleanEntity({
            ID: this.properties.Id,
            Number: this.properties.Number,
            AccessCode: this.properties.AccessCode,
            Status: this.properties.Status,
            Channel: this.properties.Channel,
            FulfillmentType: this.properties.FulfillmentType,
            CustomerName: this.properties.CustomerName,
            CustomerEmail: this.properties.CustomerEmail,
            CustomerPhone: this.properties.CustomerPhone,
            ZipCode: this.properties.ZipCode,
            Address: this.properties.Address,
            AddressNumber: this.properties.AddressNumber,
            Complement: this.properties.Complement,
            District: this.properties.District,
            City: this.properties.City,
            State: this.properties.State,
            Notes: this.properties.Notes,
            SubtotalAmount: this.properties.SubtotalAmount.toNumber(),
            DiscountAmount: this.properties.DiscountAmount.toNumber(),
            TotalAmount: this.properties.TotalAmount.toNumber(),
            CouponCode: this.properties.CouponCode,
            DeliveryType: this.properties.DeliveryType,
            CourierName: this.properties.CourierName,
            VehiclePlate: this.properties.VehiclePlate,
            DeliveryNotes: this.properties.DeliveryNotes,
            ...this.auditEntityObject(this.properties)
        });

    }

}
