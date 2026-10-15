import { Order, Orders } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { DeliveryType, FulfillmentType, OrderChannel, OrderStatus } from '@/constants/order-status';
import { AuditProperties, BaseModel } from './base';
import { OrderItemModel } from './order-item';
import { OrderPromotionModel } from './order-promotion';
import { OrderReturnModel } from './order-return';
import { OrderReturnItemModel } from './order-return-item';

export type OrderDelivery = {
    DeliveryType: DeliveryType;
    CourierName?: string;
    VehiclePlate?: string;
    DeliveryNotes?: string;
};

export type OrderPricing = {
    SubtotalAmount: Decimal;
    DiscountAmount: Decimal;
    TotalAmount: Decimal;
    CouponCode?: string;
    Items: OrderItemModel[];
    Promotions: OrderPromotionModel[];
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
    StoreUrl?: string;
    Notes?: string;
    SubtotalAmount: Decimal;
    DiscountAmount: Decimal;
    TotalAmount: Decimal;
    CouponCode?: string;
    RefundedAmount?: Decimal;
    ExchangedAmount?: Decimal;
    Items: OrderItemModel[];
    Promotions: OrderPromotionModel[];
    Returns?: OrderReturnModel[];
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
            StoreUrl: Order.StoreUrl ?? undefined,
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
            RefundedAmount: this.retrieveDecimal(Order.RefundedAmount),
            ExchangedAmount: this.retrieveDecimal(Order.ExchangedAmount),
            Items: OrderItemModel.mapModel(Order.Items ?? []),
            Promotions: OrderPromotionModel.mapModel(Order.Promotions ?? []),
            Returns: OrderReturnModel.mapModel(Order.Returns ?? []),
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

    public get StoreUrl() { return this.properties.StoreUrl; }

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

    public get RefundedAmount() { return this.properties.RefundedAmount ?? new Decimal(0); }

    public get ExchangedAmount() { return this.properties.ExchangedAmount ?? new Decimal(0); }

    public get RefundableAmount() { return Decimal.max(this.TotalAmount.plus(this.ExchangedAmount).minus(this.RefundedAmount), 0); }

    public get Items() { return this.properties.Items; }

    public get Promotions() { return this.properties.Promotions; }

    public get Returns() { return this.properties.Returns ?? []; }

    public get Replacements() { return this.Returns.flatMap((Return) => Return.Replacements); }

    public returnedQuantity(OrderItemId: string): number {

        return this.sumReturned((Item) => Item.OrderItemId === OrderItemId);

    }

    public returnedReplacementQuantity(ReplacementId: string): number {

        return this.sumReturned((Item) => Item.ReplacementId === ReplacementId);

    }

    private sumReturned(Matches: (Item: OrderReturnItemModel) => boolean): number {

        return this.Returns
            .flatMap((Return) => Return.ReturnedItems)
            .filter(Matches)
            .reduce((iTotal, Item) => iTotal + Item.Quantity, 0);

    }

    public refundFor(Item: OrderItemModel, Quantity: number): Decimal {

        if (!Item.Quantity || this.SubtotalAmount.isZero()) {
            return new Decimal(0);
        }

        return Item.TotalPrice
            .dividedBy(Item.Quantity)
            .times(Quantity)
            .times(this.TotalAmount)
            .dividedBy(this.SubtotalAmount)
            .toDecimalPlaces(2);

    }

    public withPricing(Pricing: OrderPricing): OrderModel {

        return OrderModel.with({ ...this.properties, ...Pricing });

    }

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
            StoreUrl: this.properties.StoreUrl,
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
            RefundedAmount: this.properties.RefundedAmount?.toNumber(),
            ExchangedAmount: this.properties.ExchangedAmount?.toNumber(),
            ...this.auditEntityObject(this.properties)
        });

    }

}
