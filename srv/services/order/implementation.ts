import crypto from 'crypto';
import {
    DeliveryInput,
    Order,
    OrderChangeInput,
    OrderInput,
    OrderItemInput,
    OrderQuote,
    StoreSaleInput,
    SubmitOrderResult,
    TrackedOrder
} from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, NotFoundError, TooManyRequestsError, ValidationError } from '@/errors';
import {
    DeliveryType,
    EDITABLE_ORDER_STATUSES,
    FulfillmentType,
    ORDER_STATUS_TRANSITIONS,
    OrderChannel,
    OrderStatus
} from '@/constants/order-status';
import { CouponStatus } from '@/constants/promotions';
import { OrderAddress, OrderDelivery, OrderModel } from '@/models/order';
import { OrderItemModel } from '@/models/order-item';
import { OrderRepository } from '@/repositories/order';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { PromotionRepository } from '@/repositories/promotion';
import { NotificationService } from '@/services/notification';
import { PricedLine, PricingService, PriceQuote } from '@/services/pricing';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { Messages } from '@/infrastructure/Messages';
import { OrderInputValidator, RequestedItem } from './input-validator';
import { OrderBuilder } from './order-builder';
import { OrderService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type NewOrder = OrderAddress & {
    Channel: OrderChannel;
    Status: OrderStatus;
    FulfillmentType: FulfillmentType;
    CustomerName?: string;
    CustomerEmail?: string;
    CustomerPhone?: string;
    Notes?: string;
    CouponCode?: string;
    Items: RequestedItem[];
};

export class OrderServiceImplementation extends BaseServiceImplementation<Order> implements OrderService {

    constructor(
        public readonly Repository: OrderRepository,
        private readonly VariantRepository: ProductVariantRepository,
        private readonly PromotionRepository: PromotionRepository,
        private readonly Builder: OrderBuilder,
        private readonly PricingService: PricingService,
        private readonly NotificationService: NotificationService,
        private readonly RateLimiter: RateLimiter,
        private readonly InputValidator: OrderInputValidator = new OrderInputValidator()
    ) {

        super();

    }


    public async submitOrder(Input: OrderInput): Promise<Either<AbstractError, SubmitOrderResult>> {

        if (!this.RateLimiter.tryConsume(ServiceLocator.getClientIp())) {
            return left(new TooManyRequestsError('error.tooManyOrders'));
        }

        const oValidation = this.InputValidator.validate(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        return this.execute(async () => {

            const oCreated = await this.createOrder({ ...oValidation.value, Channel: OrderChannel.Online, Status: OrderStatus.New });

            if (oCreated.isLeft()) {
                return left(oCreated.value);
            }

            const oOrder = oCreated.value;
            const sLocale = ServiceLocator.getLocale();

            ServiceLocator.afterCommit(() => this.NotificationService.sendOrderCreated(oOrder, sLocale));

            return right({ Number: oOrder.Number, AccessCode: oOrder.AccessCode });

        });

    }


    public async registerStoreSale(Input: StoreSaleInput): Promise<Either<AbstractError, SubmitOrderResult>> {

        const oValidation = this.InputValidator.validateStoreSale(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        return this.execute(async () => {

            const oCreated = await this.createOrder({
                ...oValidation.value,
                Channel: OrderChannel.Store,
                Status: OrderStatus.Completed,
                FulfillmentType: FulfillmentType.Pickup
            });

            if (oCreated.isLeft()) {
                return left(oCreated.value);
            }

            const oOrder = oCreated.value;
            const sLocale = ServiceLocator.getLocale();

            if (oOrder.CustomerEmail) {
                ServiceLocator.afterCommit(() => this.NotificationService.sendStoreSaleThanks(oOrder, sLocale));
            }

            return right({ Number: oOrder.Number, AccessCode: oOrder.AccessCode });

        });

    }


    public async quoteOrder(Items: OrderItemInput[], CouponCode?: string | null): Promise<Either<AbstractError, OrderQuote>> {

        const oItems = this.InputValidator.validateItems(Items ?? []);
        const oCoupon = this.InputValidator.normalizeCoupon(CouponCode);

        if (oItems.isLeft()) {
            return left(oItems.value);
        }

        if (oCoupon.isLeft()) {
            return left(oCoupon.value);
        }

        const oQuote = await this.PricingService.quote(oItems.value, oCoupon.value);

        return oQuote.map((oPriceQuote) => this.PricingService.toOrderQuote(oPriceQuote, ServiceLocator.getLocale()));

    }


    public async trackOrder(Number: number, AccessCode: string): Promise<Either<AbstractError, TrackedOrder>> {

        if (!Number || this.isBlank(AccessCode)) {
            return left(new NotFoundError('error.orderNotFound'));
        }

        return this.execute(async () => {

            const oOrder = await this.Repository.findWithItemsByAccess(Number, AccessCode);

            if (!oOrder) {
                return left(new NotFoundError('error.orderNotFound'));
            }

            return right(this.toTrackedOrder(oOrder));

        });

    }


    public async changeStatus(OrderId: string, Status: string, Delivery?: DeliveryInput | null): Promise<Either<AbstractError, boolean>> {

        if (!Object.values(OrderStatus).includes(Status as OrderStatus)) {
            return left(new ValidationError('error.invalidOrderStatus'));
        }

        const oDelivery = Status === OrderStatus.OutForDelivery ? this.validateDelivery(Delivery) : right(undefined);

        if (oDelivery.isLeft()) {
            return left(oDelivery.value);
        }

        return this.execute(async () => {

            const oOrder = await this.Repository.findWithItemsById(OrderId);

            if (!oOrder) {
                return left(new NotFoundError('error.orderNotFound'));
            }

            const eNewStatus = Status as OrderStatus;

            if (!ORDER_STATUS_TRANSITIONS[oOrder.Status].includes(eNewStatus)) {
                return left(new ConflictError('error.invalidStatusTransition', {
                    from: this.statusLabel(oOrder.Status),
                    to: this.statusLabel(eNewStatus)
                }));
            }

            if (eNewStatus === OrderStatus.OutForDelivery && oOrder.IsPickup) {
                return left(new ConflictError('error.pickupOrderCannotBeDelivered'));
            }

            if (eNewStatus === OrderStatus.Cancelled) {
                await this.restoreStock(oOrder);
                await this.releaseCoupon(oOrder);
            }

            await this.Repository.updateStatus(oOrder.Id, eNewStatus, oDelivery.value);

            const sLocale = ServiceLocator.getLocale();
            const oUpdatedOrder = oOrder.withStatus(eNewStatus, oDelivery.value);

            if (oUpdatedOrder.CustomerEmail) {
                ServiceLocator.afterCommit(() => this.NotificationService.sendOrderStatusChanged(oUpdatedOrder, sLocale));
            }

            return right(true);

        });

    }


    public async trackingUrl(OrderId: string): Promise<Either<AbstractError, string | null>> {

        return this.execute(async () => {

            const oOrder = await this.Repository.findById(OrderId);

            if (!oOrder) {
                return left(new NotFoundError('error.orderNotFound'));
            }

            return right((await this.NotificationService.trackingLink(oOrder)) ?? null);

        });

    }


    public async quoteOrderUpdate(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>> {

        return this.changeItems(OrderId, Change, false);

    }


    public async updateOrderItems(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>> {

        return this.changeItems(OrderId, Change, true);

    }


    private async changeItems(OrderId: string, Change: OrderChangeInput, Persist: boolean): Promise<Either<AbstractError, OrderQuote>> {

        const oItems = this.InputValidator.validateItems(Change?.Items ?? []);
        const oCoupon = this.InputValidator.normalizeCoupon(Change?.CouponCode);

        if (oItems.isLeft()) {
            return left(oItems.value);
        }

        if (oCoupon.isLeft()) {
            return left(oCoupon.value);
        }

        return this.execute(async () => {

            const oOrder = await this.Repository.findWithItemsById(OrderId);

            if (!oOrder) {
                return left(new NotFoundError('error.orderNotFound'));
            }

            if (!EDITABLE_ORDER_STATUSES.includes(oOrder.Status)) {
                return left(new ConflictError('error.orderNotEditable', { status: this.statusLabel(oOrder.Status) }));
            }

            const sCouponCode = oCoupon.value;
            const oQuote = await this.PricingService.quote(oItems.value, sCouponCode, {
                couponReserved: Boolean(sCouponCode) && sCouponCode === oOrder.CouponCode?.toUpperCase(),
                automaticPromotions: Change?.ApplyPromotions === true
            });

            if (oQuote.isLeft()) {
                return left(oQuote.value);
            }

            if (Persist && sCouponCode && oQuote.value.couponStatus !== CouponStatus.Applied) {
                return left(new ConflictError('error.couponNotApplied', {
                    reason: Messages.text(`coupon.${oQuote.value.couponStatus}`, ServiceLocator.getLocale())
                }));
            }

            if (Persist) {

                const oApplied = await this.applyItemChange(oOrder, oQuote.value);

                if (oApplied.isLeft()) {
                    return left(oApplied.value);
                }

            }

            return right(this.PricingService.toOrderQuote(oQuote.value, ServiceLocator.getLocale()));

        });

    }


    private async applyItemChange(Order: OrderModel, Quote: PriceQuote): Promise<Either<AbstractError, boolean>> {

        const oStock = await this.adjustStock(Order.Items, Quote.lines);

        if (oStock.isLeft()) {
            return left(oStock.value);
        }

        const oCoupon = await this.swapCoupon(Order, Quote);

        if (oCoupon.isLeft()) {
            return left(oCoupon.value);
        }

        const oUpdatedOrder = Order.withPricing({
            SubtotalAmount: Quote.subtotal,
            DiscountAmount: Quote.discount,
            TotalAmount: Quote.total,
            CouponCode: Quote.couponCode,
            Items: this.Builder.items(Order.Id, Quote.lines, await this.Builder.coverImages(Quote.lines)),
            Promotions: this.Builder.promotions(Order.Id, Quote)
        });

        await this.Repository.replaceItems(oUpdatedOrder);

        const sLocale = ServiceLocator.getLocale();

        if (oUpdatedOrder.CustomerEmail) {
            ServiceLocator.afterCommit(() => this.NotificationService.sendOrderUpdated(oUpdatedOrder, sLocale));
        }

        return right(true);

    }


    private async swapCoupon(Order: OrderModel, Quote: PriceQuote): Promise<Either<AbstractError, boolean>> {

        const sCurrent = Order.CouponCode?.toUpperCase();
        const sNext = Quote.couponCode?.toUpperCase();

        if (sCurrent === sNext) {
            return right(true);
        }

        if (sCurrent) {
            await this.releaseCoupon(Order);
        }

        return sNext ? this.consumeCoupon(Quote) : right(true);

    }


    private async adjustStock(Current: OrderItemModel[], Lines: PricedLine[]): Promise<Either<AbstractError, boolean>> {

        const oDeltas = new Map<string, number>();

        Current.forEach((oItem) => oDeltas.set(oItem.VariantId, (oDeltas.get(oItem.VariantId) ?? 0) - oItem.Quantity));
        Lines.forEach((oLine) => oDeltas.set(oLine.variant.Id, (oDeltas.get(oLine.variant.Id) ?? 0) + oLine.quantity));

        for (const [sVariantId, iDelta] of oDeltas) {

            if (iDelta < 0) {
                await this.VariantRepository.increaseStock(sVariantId, -iDelta);
            }

        }

        for (const oLine of Lines) {

            const iDelta = oDeltas.get(oLine.variant.Id) ?? 0;

            if (iDelta > 0 && !await this.VariantRepository.decreaseStock(oLine.variant.Id, iDelta)) {

                return left(new ConflictError('error.insufficientStock', {
                    product: oLine.variant.Description,
                    stock: oLine.variant.Stock
                }));

            }

        }

        return right(true);

    }


    private async createOrder(Input: NewOrder): Promise<Either<AbstractError, OrderModel>> {

        const oQuote = await this.PricingService.quote(Input.Items, Input.CouponCode);

        if (oQuote.isLeft()) {
            return left(oQuote.value);
        }

        if (Input.CouponCode && oQuote.value.couponStatus !== CouponStatus.Applied) {
            return left(new ConflictError('error.couponNotApplied', {
                reason: Messages.text(`coupon.${oQuote.value.couponStatus}`, ServiceLocator.getLocale())
            }));
        }

        const oReservation = await this.reserveStock(oQuote.value);

        if (oReservation.isLeft()) {
            return left(oReservation.value);
        }

        const oCoupon = await this.consumeCoupon(oQuote.value);

        if (oCoupon.isLeft()) {
            return left(oCoupon.value);
        }

        const oCovers = await this.Builder.coverImages(oQuote.value.lines);
        const oOrder = this.buildOrder(Input, oQuote.value, oCovers, await this.Repository.findNextNumber());

        await this.Repository.createEntry(oOrder);

        return right(oOrder);

    }


    private async reserveStock(Quote: PriceQuote): Promise<Either<AbstractError, boolean>> {

        for (const oLine of Quote.lines) {

            if (!await this.VariantRepository.decreaseStock(oLine.variant.Id, oLine.quantity)) {

                return left(new ConflictError('error.insufficientStock', {
                    product: oLine.variant.Description,
                    stock: oLine.variant.Stock
                }));

            }

        }

        return right(true);

    }


    private async consumeCoupon(Quote: PriceQuote): Promise<Either<AbstractError, boolean>> {

        const oCouponPromotion = Quote.promotions.find((oPriced) => oPriced.promotion.IsCoupon);

        if (oCouponPromotion && !await this.PromotionRepository.consumeCoupon(oCouponPromotion.promotion.Id)) {
            return left(new ConflictError('error.couponExhausted'));
        }

        return right(true);

    }


    private async releaseCoupon(Order: OrderModel): Promise<void> {

        const oCouponPromotion = Order.Promotions.find((oPromotion) => oPromotion.CouponCode && oPromotion.PromotionId);

        if (oCouponPromotion) {
            await this.PromotionRepository.releaseCoupon(oCouponPromotion.PromotionId as string);
        }

    }


    private buildOrder(Input: NewOrder, Quote: PriceQuote, Covers: Map<string, string>, Number: number): OrderModel {

        const sOrderId = this.generateUUID();

        return OrderModel.with({
            Id: sOrderId,
            Number,
            AccessCode: crypto.randomBytes(16).toString('hex'),
            Status: Input.Status,
            Channel: Input.Channel,
            FulfillmentType: Input.FulfillmentType,
            CustomerName: Input.CustomerName,
            CustomerEmail: Input.CustomerEmail,
            CustomerPhone: Input.CustomerPhone,
            ZipCode: Input.ZipCode,
            Address: Input.Address,
            AddressNumber: Input.AddressNumber,
            Complement: Input.Complement,
            District: Input.District,
            City: Input.City,
            State: Input.State,
            Notes: Input.Notes,
            SubtotalAmount: Quote.subtotal,
            DiscountAmount: Quote.discount,
            TotalAmount: Quote.total,
            CouponCode: Quote.couponCode,
            Items: this.Builder.items(sOrderId, Quote.lines, Covers),
            Promotions: this.Builder.promotions(sOrderId, Quote),
            CreatedAt: new Date().toISOString()
        });

    }


    private validateDelivery(Delivery?: DeliveryInput | null): Either<AbstractError, OrderDelivery> {

        const eDeliveryType = Delivery?.DeliveryType as DeliveryType;

        if (!Object.values(DeliveryType).includes(eDeliveryType)) {
            return left(new ValidationError('error.deliveryTypeRequired'));
        }

        if (eDeliveryType !== DeliveryType.CustomerArranged && this.isBlank(Delivery?.CourierName)) {
            return left(new ValidationError('error.courierNameRequired'));
        }

        if (eDeliveryType === DeliveryType.UberFlash && this.isBlank(Delivery?.VehiclePlate)) {
            return left(new ValidationError('error.vehiclePlateRequired'));
        }

        return right({
            DeliveryType: eDeliveryType,
            CourierName: Delivery?.CourierName?.trim() || undefined,
            VehiclePlate: Delivery?.VehiclePlate?.trim().toUpperCase() || undefined,
            DeliveryNotes: Delivery?.DeliveryNotes?.trim() || undefined
        });

    }


    private async restoreStock(Order: OrderModel): Promise<void> {

        for (const oItem of Order.Items) {

            if (oItem.VariantId) {
                await this.VariantRepository.increaseStock(oItem.VariantId, oItem.Quantity);
            }

        }

    }


    private toTrackedOrder(Order: OrderModel): TrackedOrder {

        return {
            Number: Order.Number,
            Status: Order.Status,
            CustomerName: Order.CustomerName,
            FulfillmentType: Order.FulfillmentType,
            SubtotalAmount: Order.SubtotalAmount.toNumber(),
            DiscountAmount: Order.DiscountAmount.toNumber(),
            TotalAmount: Order.TotalAmount.toNumber(),
            CouponCode: Order.CouponCode,
            Promotions: Order.Promotions.map((oPromotion) => ({
                PromotionName: oPromotion.PromotionName,
                RewardType: oPromotion.RewardType,
                DiscountAmount: oPromotion.DiscountAmount.toNumber(),
                GiftDescription: oPromotion.GiftDescription,
                CouponCode: oPromotion.CouponCode
            })),
            DeliveryType: Order.DeliveryType,
            CourierName: Order.CourierName,
            VehiclePlate: Order.VehiclePlate,
            DeliveryNotes: Order.DeliveryNotes,
            createdAt: Order.CreatedAt,
            modifiedAt: Order.ModifiedAt,
            Items: Order.Items.map((oItem) => ({
                ProductId: oItem.ProductId,
                ImageId: oItem.ImageId,
                ProductName: oItem.ProductName,
                ColorName: oItem.ColorName,
                Size: oItem.Size,
                Quantity: oItem.Quantity,
                UnitPrice: oItem.UnitPrice.toNumber(),
                TotalPrice: oItem.TotalPrice.toNumber()
            })),
            Returns: Order.Returns.map((oReturn) => ({
                createdAt: oReturn.CreatedAt,
                RefundAmount: oReturn.RefundAmount.toNumber(),
                ExchangeAmount: oReturn.ExchangeAmount.toNumber(),
                BalanceAmount: oReturn.BalanceAmount.toNumber(),
                Items: oReturn.Items.map((oItem) => ({
                    Kind: oItem.Kind,
                    ProductName: oItem.ProductName,
                    ColorName: oItem.ColorName,
                    Size: oItem.Size,
                    Quantity: oItem.Quantity
                }))
            }))
        };

    }


    private statusLabel(Status: OrderStatus): string {

        return Messages.text(`orderStatus.${Status}`, ServiceLocator.getLocale());

    }

}
