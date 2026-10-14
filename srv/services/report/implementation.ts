import Decimal from 'decimal.js';
import { MonthlySales, ProductSales, SalesReport } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { DeliveryType, OPEN_ORDER_STATUSES, OrderStatus } from '@/constants/order-status';
import { OrderModel } from '@/models/order';
import { OrderRepository } from '@/repositories/order';
import { ReportService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const MONTHS_IN_YEAR = 12;
const TOP_PRODUCTS_LIMIT = 10;
const YEAR_RANGE = { min: 2000, max: 2100 };

type ProductTotals = { quantity: number; revenue: Decimal };

export class ReportServiceImplementation extends BaseServiceImplementation<SalesReport> implements ReportService {

    constructor(private readonly OrderRepository: OrderRepository) {

        super();

    }


    public async salesReport(Year: number): Promise<Either<AbstractError, SalesReport>> {

        if (!Number.isInteger(Year) || Year < YEAR_RANGE.min || Year > YEAR_RANGE.max) {
            return left(new ValidationError('error.invalidReportYear'));
        }

        return this.execute(async () => {

            const aOrders = await this.OrderRepository.findWithItemsByPeriod(
                new Date(Date.UTC(Year, 0, 1)),
                new Date(Date.UTC(Year + 1, 0, 1))
            );

            return right(this.buildReport(Year, aOrders));

        });

    }


    private buildReport(Year: number, Orders: OrderModel[]): SalesReport {

        const aCompleted = Orders.filter((oOrder) => oOrder.Status === OrderStatus.Completed);
        const aOpen = Orders.filter((oOrder) => OPEN_ORDER_STATUSES.includes(oOrder.Status));
        const oRevenue = this.sumAmounts(aCompleted);
        const iItemsSold = aCompleted.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0);

        return {
            Year,
            CompletedOrders: aCompleted.length,
            ItemsSold: iItemsSold,
            Revenue: oRevenue.toNumber(),
            AverageTicket: aCompleted.length ? oRevenue.dividedBy(aCompleted.length).toDecimalPlaces(2).toNumber() : 0,
            OpenOrders: aOpen.length,
            OpenAmount: this.sumAmounts(aOpen).toNumber(),
            CancelledOrders: Orders.filter((oOrder) => oOrder.Status === OrderStatus.Cancelled).length,
            CustomerArrangedDeliveries: aCompleted.filter((oOrder) => oOrder.DeliveryType === DeliveryType.CustomerArranged).length,
            Months: this.buildMonths(aCompleted),
            TopProducts: this.buildTopProducts(aCompleted)
        };

    }


    private buildMonths(Orders: OrderModel[]): MonthlySales[] {

        return Array.from({ length: MONTHS_IN_YEAR }, (_, iIndex) => {

            const aMonthOrders = Orders.filter((oOrder) => new Date(oOrder.CreatedAt as string).getUTCMonth() === iIndex);

            return {
                Month: iIndex + 1,
                Orders: aMonthOrders.length,
                Items: aMonthOrders.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0),
                Revenue: this.sumAmounts(aMonthOrders).toNumber()
            };

        });

    }


    private buildTopProducts(Orders: OrderModel[]): ProductSales[] {

        const oTotals = new Map<string, ProductTotals>();

        Orders.flatMap((oOrder) => oOrder.Items).forEach((oItem) => {

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


    private countItems(Order: OrderModel): number {

        return Order.Items.reduce((iTotal, oItem) => iTotal + oItem.Quantity, 0);

    }

}
