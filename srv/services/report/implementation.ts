import Decimal from 'decimal.js';
import { MonthlySales, ProductSales, SalesReport } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { DeliveryType, OPEN_ORDER_STATUSES, OrderStatus } from '@/constants/order-status';
import { OrderModel } from '@/models/order';
import { OrderReturnModel } from '@/models/order-return';
import { OrderRepository } from '@/repositories/order';
import { OrderReturnRepository } from '@/repositories/order-return';
import { ReportService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const MONTHS_IN_YEAR = 12;
const TOP_PRODUCTS_LIMIT = 10;
const YEAR_RANGE = { min: 2000, max: 2100 };

type ProductTotals = { quantity: number; revenue: Decimal };

type SoldItem = { ProductName: string; Quantity: number; TotalPrice: Decimal };

export class ReportServiceImplementation extends BaseServiceImplementation<SalesReport> implements ReportService {

    constructor(
        private readonly OrderRepository: OrderRepository,
        private readonly ReturnRepository: OrderReturnRepository
    ) {

        super();

    }


    public async salesReport(Year: number): Promise<Either<AbstractError, SalesReport>> {

        if (!Number.isInteger(Year) || Year < YEAR_RANGE.min || Year > YEAR_RANGE.max) {
            return left(new ValidationError('error.invalidReportYear'));
        }

        return this.execute(async () => {

            const oStart = new Date(Date.UTC(Year, 0, 1));
            const oEnd = new Date(Date.UTC(Year + 1, 0, 1));
            const [aOrders, aReturns] = await Promise.all([
                this.OrderRepository.findWithItemsByPeriod(oStart, oEnd),
                this.ReturnRepository.findWithItemsByPeriod(oStart, oEnd)
            ]);

            return right(this.buildReport(Year, aOrders, aReturns));

        });

    }


    private buildReport(Year: number, Orders: OrderModel[], Returns: OrderReturnModel[]): SalesReport {

        const aCompleted = Orders.filter((oOrder) => oOrder.Status === OrderStatus.Completed);
        const aOpen = Orders.filter((oOrder) => OPEN_ORDER_STATUSES.includes(oOrder.Status));
        const oGrossRevenue = this.sumAmounts(aCompleted);
        const oRefunded = this.sumReturns(Returns, 'RefundAmount');
        const oExchanged = this.sumReturns(Returns, 'ExchangeAmount');
        const oRevenue = oGrossRevenue.minus(oRefunded).plus(oExchanged);
        const iItemsSold = aCompleted.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0);
        const aReturnedItems = Returns.flatMap((oReturn) => oReturn.ReturnedItems);

        return {
            Year,
            CompletedOrders: aCompleted.length,
            ItemsSold: iItemsSold,
            Revenue: oRevenue.toNumber(),
            GrossRevenue: oGrossRevenue.toNumber(),
            ReturnsCount: Returns.length,
            ReturnedItems: aReturnedItems.reduce((iTotal, oItem) => iTotal + oItem.Quantity, 0),
            RefundedAmount: oRefunded.toNumber(),
            ExchangedAmount: oExchanged.toNumber(),
            AverageTicket: aCompleted.length ? oRevenue.dividedBy(aCompleted.length).toDecimalPlaces(2).toNumber() : 0,
            OpenOrders: aOpen.length,
            OpenAmount: this.sumAmounts(aOpen).toNumber(),
            CancelledOrders: Orders.filter((oOrder) => oOrder.Status === OrderStatus.Cancelled).length,
            CustomerArrangedDeliveries: aCompleted.filter((oOrder) => oOrder.DeliveryType === DeliveryType.CustomerArranged).length,
            Months: this.buildMonths(aCompleted, Returns),
            TopProducts: this.rankProducts(aCompleted.flatMap((oOrder) => oOrder.Items)),
            TopReturned: this.rankProducts(aReturnedItems)
        };

    }


    private buildMonths(Orders: OrderModel[], Returns: OrderReturnModel[]): MonthlySales[] {

        return Array.from({ length: MONTHS_IN_YEAR }, (_, iIndex) => {

            const aMonthOrders = Orders.filter((oOrder) => this.monthOf(oOrder.CreatedAt) === iIndex);
            const aMonthReturns = Returns.filter((oReturn) => this.monthOf(oReturn.CreatedAt) === iIndex);
            const oRefunds = this.sumReturns(aMonthReturns, 'RefundAmount');

            return {
                Month: iIndex + 1,
                Orders: aMonthOrders.length,
                Items: aMonthOrders.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0),
                Revenue: this.sumAmounts(aMonthOrders).minus(oRefunds).plus(this.sumReturns(aMonthReturns, 'ExchangeAmount')).toNumber(),
                Refunds: oRefunds.toNumber()
            };

        });

    }


    private rankProducts(Items: SoldItem[]): ProductSales[] {

        const oTotals = new Map<string, ProductTotals>();

        Items.forEach((oItem) => {

            const oCurrent = oTotals.get(oItem.ProductName) ?? { quantity: 0, revenue: new Decimal(0) };

            oTotals.set(oItem.ProductName, {
                quantity: oCurrent.quantity + oItem.Quantity,
                revenue: oCurrent.revenue.plus(oItem.TotalPrice)
            });

        });

        return [...oTotals]
            .sort(([, oFirst], [, oSecond]) => oSecond.quantity - oFirst.quantity || oSecond.revenue.comparedTo(oFirst.revenue))
            .slice(0, TOP_PRODUCTS_LIMIT)
            .map(([sProductName, oTotal]) => ({
                ProductName: sProductName,
                Quantity: oTotal.quantity,
                Revenue: oTotal.revenue.toNumber()
            }));

    }


    private sumAmounts(Orders: OrderModel[]): Decimal {

        return Orders.reduce((oTotal, oOrder) => oTotal.plus(oOrder.TotalAmount), new Decimal(0));

    }


    private sumReturns(Returns: OrderReturnModel[], Field: 'RefundAmount' | 'ExchangeAmount'): Decimal {

        return Returns.reduce((oTotal, oReturn) => oTotal.plus(oReturn[Field]), new Decimal(0));

    }


    private monthOf(Timestamp: string | undefined): number {

        return new Date(Timestamp as string).getUTCMonth();

    }


    private countItems(Order: OrderModel): number {

        return Order.Items.reduce((iTotal, oItem) => iTotal + oItem.Quantity, 0);

    }

}
