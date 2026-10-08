import crypto from 'crypto';
import Decimal from 'decimal.js';
import { Order, OrderInput, SubmitOrderResult, TrackedOrder } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, NotFoundError, TooManyRequestsError, ValidationError } from '@/errors';
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from '@/constants/order-status';
import { OrderModel } from '@/models/order';
import { OrderItemModel } from '@/models/order-item';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { OrderRepository } from '@/repositories/order';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { NotificationService } from '@/services/notification';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { Messages } from '@/infrastructure/Messages';
import { OrderInputValidator, RequestedItem, ValidOrderInput } from './input-validator';
import { OrderService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

export class OrderServiceImplementation extends BaseServiceImplementation<Order> implements OrderService {

    constructor(
        public readonly Repository: OrderRepository,
        private readonly VariantRepository: ProductVariantRepository,
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

        return this.execute(() => this.createOrder(oValidation.value));

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


    public async changeStatus(OrderId: string, Status: string): Promise<Either<AbstractError, boolean>> {

        if (!Object.values(OrderStatus).includes(Status as OrderStatus)) {
            return left(new ValidationError('error.invalidOrderStatus'));
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

            if (eNewStatus === OrderStatus.Cancelled) {
                await this.restoreStock(oOrder);
            }

            await this.Repository.updateStatus(oOrder.Id, eNewStatus);

            const sLocale = ServiceLocator.getLocale();
            const oUpdatedOrder = oOrder.withStatus(eNewStatus);

            ServiceLocator.afterCommit(() => this.NotificationService.sendOrderStatusChanged(oUpdatedOrder, sLocale));

            return right(true);

        });

    }


    private async createOrder(Input: ValidOrderInput): Promise<Either<AbstractError, SubmitOrderResult>> {

        const oVariants = await this.findOrderableVariants(Input.Items);

        if (oVariants.isLeft()) {
            return left(oVariants.value);
        }

        const oReservation = await this.reserveStock(Input.Items, oVariants.value);

        if (oReservation.isLeft()) {
            return left(oReservation.value);
        }

        const oOrder = this.buildOrder(Input, oVariants.value, await this.Repository.findNextNumber());

        await this.Repository.createEntry(oOrder);

        const sLocale = ServiceLocator.getLocale();

        ServiceLocator.afterCommit(() => this.NotificationService.sendOrderCreated(oOrder, sLocale));

        return right({ Number: oOrder.Number, AccessCode: oOrder.AccessCode });

    }


    private async findOrderableVariants(Items: RequestedItem[]): Promise<Either<AbstractError, Map<string, OrderableVariantModel>>> {

        const aVariants = await this.VariantRepository.findOrderableByIds(Items.map((oItem) => oItem.VariantId));

        const oVariants = new Map(aVariants.map((oVariant) => [oVariant.Id, oVariant]));

        const bUnavailable = Items.some((oItem) => !oVariants.get(oItem.VariantId)?.ProductActive);

        if (bUnavailable) {
            return left(new NotFoundError('error.productUnavailable'));
        }

        return right(oVariants);

    }


    private async reserveStock(Items: RequestedItem[], Variants: Map<string, OrderableVariantModel>): Promise<Either<AbstractError, boolean>> {

        for (const oItem of Items) {

            const bReserved = await this.VariantRepository.decreaseStock(oItem.VariantId, oItem.Quantity);

            if (!bReserved) {

                const oVariant = Variants.get(oItem.VariantId) as OrderableVariantModel;

                return left(new ConflictError('error.insufficientStock', {
                    product: [oVariant.ProductName, oVariant.ColorName, oVariant.Size].filter(Boolean).join(' / '),
                    stock: oVariant.Stock
                }));

            }

        }

        return right(true);

    }


    private buildOrder(Input: ValidOrderInput, Variants: Map<string, OrderableVariantModel>, Number: number): OrderModel {

        const sOrderId = this.generateUUID();

        const aItems = Input.Items.map((oItem) => {

            const oVariant = Variants.get(oItem.VariantId) as OrderableVariantModel;

            return OrderItemModel.with({
                Id: this.generateUUID(),
                OrderId: sOrderId,
                VariantId: oVariant.Id,
                ProductName: oVariant.ProductName,
                ColorName: oVariant.ColorName,
                Size: oVariant.Size,
                Quantity: oItem.Quantity,
                UnitPrice: oVariant.Price,
                TotalPrice: oVariant.Price.times(oItem.Quantity)
            });

        });

        return OrderModel.with({
            Id: sOrderId,
            Number,
            AccessCode: crypto.randomBytes(16).toString('hex'),
            Status: OrderStatus.New,
            CustomerName: Input.CustomerName,
            CustomerEmail: Input.CustomerEmail,
            CustomerPhone: Input.CustomerPhone,
            Address: Input.Address,
            District: Input.District,
            City: Input.City,
            ZipCode: Input.ZipCode,
            Notes: Input.Notes,
            TotalAmount: aItems.reduce((oTotal, oItem) => oTotal.plus(oItem.TotalPrice), new Decimal(0)),
            Items: aItems,
            CreatedAt: new Date().toISOString()
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
            TotalAmount: Order.TotalAmount.toNumber(),
            createdAt: Order.CreatedAt,
            modifiedAt: Order.ModifiedAt,
            Items: Order.Items.map((oItem) => ({
                ProductName: oItem.ProductName,
                ColorName: oItem.ColorName,
                Size: oItem.Size,
                Quantity: oItem.Quantity,
                UnitPrice: oItem.UnitPrice.toNumber(),
                TotalPrice: oItem.TotalPrice.toNumber()
            }))
        };

    }


    private statusLabel(Status: OrderStatus): string {

        return Messages.text(`orderStatus.${Status}`, ServiceLocator.getLocale());

    }

}
