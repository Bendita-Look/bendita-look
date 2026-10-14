import Decimal from 'decimal.js';
import { OrderReturn, ReturnInput, ReturnQuote } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, NotFoundError, ValidationError } from '@/errors';
import { OrderStatus, ReturnItemKind } from '@/constants/order-status';
import { OrderModel } from '@/models/order';
import { OrderItemModel } from '@/models/order-item';
import { OrderReturnModel } from '@/models/order-return';
import { OrderReturnItemModel } from '@/models/order-return-item';
import { OrderRepository } from '@/repositories/order';
import { OrderReturnRepository } from '@/repositories/order-return';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { NotificationService } from '@/services/notification';
import { PricedLine, PricingService } from '@/services/pricing';
import { OrderBuilder } from '@/services/order/order-builder';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { OrderReturnValidator, RequestedReturnItem, ValidReturnInput } from './return-validator';
import { OrderReturnService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type ReturnedLine = {
    item: OrderItemModel;
    quantity: number;
    restock: boolean;
    refund: Decimal;
};

type ReturnCalculation = {
    returned: ReturnedLine[];
    replacements: PricedLine[];
    refund: Decimal;
    exchange: Decimal;
    balance: Decimal;
};

export class OrderReturnServiceImplementation extends BaseServiceImplementation<OrderReturn> implements OrderReturnService {

    constructor(
        public readonly Repository: OrderReturnRepository,
        private readonly OrderRepository: OrderRepository,
        private readonly VariantRepository: ProductVariantRepository,
        private readonly PricingService: PricingService,
        private readonly Builder: OrderBuilder,
        private readonly NotificationService: NotificationService,
        private readonly Validator: OrderReturnValidator = new OrderReturnValidator()
    ) {

        super();

    }


    public async quoteReturn(OrderId: string, Input: ReturnInput): Promise<Either<AbstractError, ReturnQuote>> {

        return this.process(OrderId, Input, false);

    }


    public async registerReturn(OrderId: string, Input: ReturnInput): Promise<Either<AbstractError, ReturnQuote>> {

        return this.process(OrderId, Input, true);

    }


    private async process(OrderId: string, Input: ReturnInput, Persist: boolean): Promise<Either<AbstractError, ReturnQuote>> {

        const oValidation = this.Validator.validate(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        return this.execute(async () => {

            const oOrder = await this.OrderRepository.findWithItemsById(OrderId);

            if (!oOrder) {
                return left(new NotFoundError('error.orderNotFound'));
            }

            if (oOrder.Status !== OrderStatus.Completed) {
                return left(new ConflictError('error.returnRequiresCompleted'));
            }

            const oCalculation = await this.calculate(oOrder, oValidation.value);

            if (oCalculation.isLeft()) {
                return left(oCalculation.value);
            }

            if (Persist) {

                const oSaved = await this.save(oOrder, oValidation.value, oCalculation.value);

                if (oSaved.isLeft()) {
                    return left(oSaved.value);
                }

            }

            return right({
                RefundAmount: oCalculation.value.refund.toNumber(),
                ExchangeAmount: oCalculation.value.exchange.toNumber(),
                BalanceAmount: oCalculation.value.balance.toNumber()
            });

        });

    }


    private async calculate(Order: OrderModel, Input: ValidReturnInput): Promise<Either<AbstractError, ReturnCalculation>> {

        const oReturned = this.returnedLines(Order, Input.Items);

        if (oReturned.isLeft()) {
            return left(oReturned.value);
        }

        const oReplacements = Input.Replacements.length ? await this.PricingService.priceItems(Input.Replacements) : right([]);

        if (oReplacements.isLeft()) {
            return left(oReplacements.value);
        }

        const oRefund = Decimal.min(
            oReturned.value.reduce((oTotal, oLine) => oTotal.plus(oLine.refund), new Decimal(0)),
            Order.RefundableAmount
        );
        const oExchange = oReplacements.value.reduce((oTotal, oLine) => oTotal.plus(oLine.total), new Decimal(0)).toDecimalPlaces(2);

        return right({
            returned: oReturned.value,
            replacements: oReplacements.value,
            refund: oRefund,
            exchange: oExchange,
            balance: oExchange.minus(oRefund)
        });

    }


    private returnedLines(Order: OrderModel, Items: RequestedReturnItem[]): Either<AbstractError, ReturnedLine[]> {

        const aLines: ReturnedLine[] = [];

        for (const oRequested of Items) {

            const oItem = Order.Items.find((oOrderItem) => oOrderItem.Id === oRequested.OrderItemId);

            if (!oItem) {
                return left(new ValidationError('error.invalidReturnItem'));
            }

            const iAvailable = oItem.Quantity - Order.returnedQuantity(oItem.Id);

            if (oRequested.Quantity > iAvailable) {
                return left(new ConflictError('error.returnQuantityExceeded', {
                    product: [oItem.ProductName, oItem.ColorName, oItem.Size].filter(Boolean).join(' / '),
                    available: iAvailable
                }));
            }

            aLines.push({
                item: oItem,
                quantity: oRequested.Quantity,
                restock: oRequested.Restock,
                refund: Order.refundFor(oItem, oRequested.Quantity)
            });

        }

        return right(aLines);

    }


    private async save(Order: OrderModel, Input: ValidReturnInput, Calculation: ReturnCalculation): Promise<Either<AbstractError, boolean>> {

        for (const oLine of Calculation.returned.filter((oReturned) => oReturned.restock)) {
            await this.VariantRepository.increaseStock(oLine.item.VariantId, oLine.quantity);
        }

        for (const oLine of Calculation.replacements) {

            if (!await this.VariantRepository.decreaseStock(oLine.variant.Id, oLine.quantity)) {

                return left(new ConflictError('error.insufficientStock', {
                    product: oLine.variant.Description,
                    stock: oLine.variant.Stock
                }));

            }

        }

        const oReturn = this.buildReturn(Order, Input, Calculation, await this.Builder.coverImages(Calculation.replacements));

        await this.Repository.createEntry(oReturn);
        await this.OrderRepository.addReturnTotals(Order.Id, Calculation.refund, Calculation.exchange);

        const sLocale = ServiceLocator.getLocale();

        if (Order.CustomerEmail) {
            ServiceLocator.afterCommit(() => this.NotificationService.sendOrderReturn(Order, oReturn, sLocale));
        }

        return right(true);

    }


    private buildReturn(Order: OrderModel, Input: ValidReturnInput, Calculation: ReturnCalculation, Covers: Map<string, string>): OrderReturnModel {

        const sReturnId = this.generateUUID();

        const aReturned = Calculation.returned.map((oLine) => OrderReturnItemModel.with({
            Id: this.generateUUID(),
            ReturnId: sReturnId,
            Kind: ReturnItemKind.Returned,
            OrderItemId: oLine.item.Id,
            VariantId: oLine.item.VariantId,
            ProductId: oLine.item.ProductId,
            ImageId: oLine.item.ImageId,
            ProductName: oLine.item.ProductName,
            ColorName: oLine.item.ColorName,
            Size: oLine.item.Size,
            Quantity: oLine.quantity,
            UnitPrice: oLine.item.UnitPrice,
            TotalPrice: oLine.refund,
            Restock: oLine.restock
        }));

        const aReplacements = Calculation.replacements.map((oLine) => OrderReturnItemModel.with({
            Id: this.generateUUID(),
            ReturnId: sReturnId,
            Kind: ReturnItemKind.Replacement,
            VariantId: oLine.variant.Id,
            ProductId: oLine.variant.ProductId,
            ImageId: Covers.get(oLine.variant.Id),
            ProductName: oLine.variant.ProductName,
            ColorName: oLine.variant.ColorName,
            Size: oLine.variant.Size,
            Quantity: oLine.quantity,
            UnitPrice: oLine.variant.Price,
            TotalPrice: oLine.total,
            Restock: false
        }));

        return OrderReturnModel.with({
            Id: sReturnId,
            OrderId: Order.Id,
            Reason: Input.Reason,
            RefundAmount: Calculation.refund,
            ExchangeAmount: Calculation.exchange,
            BalanceAmount: Calculation.balance,
            Items: [...aReturned, ...aReplacements],
            CreatedAt: new Date().toISOString()
        });

    }

}
