import Decimal from 'decimal.js';
import { CategorySales, MonthlySales, ProductSales, SalesReport } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { DeliveryType, OPEN_ORDER_STATUSES, OrderStatus } from '@/constants/order-status';
import { OrderModel } from '@/models/order';
import { OrderReturnModel } from '@/models/order-return';
import { StockEntryModel } from '@/models/stock-entry';
import { OrderRepository } from '@/repositories/order';
import { OrderReturnRepository } from '@/repositories/order-return';
import { StockEntryRepository } from '@/repositories/stock-entry';
import { ReportService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const MONTHS_IN_YEAR = 12;
const TOP_PRODUCTS_LIMIT = 10;
const PERCENT = 100;
const YEAR_RANGE = { min: 2000, max: 2100 };

type LedgerKind = 'sale' | 'returned' | 'replacement';

type LedgerLine = {
    kind: LedgerKind;
    month: number;
    productName: string;
    categoryName?: string;
    quantity: number;
    revenue: Decimal;
    cost: Decimal;
    missingCost: boolean;
};

type Totals = { quantity: number; revenue: Decimal; cost: Decimal };

export class ReportServiceImplementation extends BaseServiceImplementation<SalesReport> implements ReportService {

    constructor(
        private readonly OrderRepository: OrderRepository,
        private readonly ReturnRepository: OrderReturnRepository,
        private readonly StockEntryRepository: StockEntryRepository
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
            const [aOrders, aReturns, aEntries] = await Promise.all([
                this.OrderRepository.findWithItemsByPeriod(oStart, oEnd),
                this.ReturnRepository.findWithItemsByPeriod(oStart, oEnd),
                this.StockEntryRepository.findByPeriod(oStart, oEnd)
            ]);

            return right(this.buildReport(Year, aOrders, aReturns, aEntries));

        });

    }


    private buildReport(Year: number, Orders: OrderModel[], Returns: OrderReturnModel[], Entries: StockEntryModel[]): SalesReport {

        const aCompleted = Orders.filter((oOrder) => oOrder.Status === OrderStatus.Completed);
        const aOpen = Orders.filter((oOrder) => OPEN_ORDER_STATUSES.includes(oOrder.Status));
        const aLedger = [...this.saleLines(aCompleted), ...this.returnLines(Returns)];
        const oGrossRevenue = this.sumAmounts(aCompleted);
        const oRefunded = this.sumReturns(Returns, 'RefundAmount');
        const oExchanged = this.sumReturns(Returns, 'ExchangeAmount');
        const oRevenue = oGrossRevenue.minus(oRefunded).plus(oExchanged);
        const oCost = this.sum(aLedger, (oLine) => oLine.cost);
        const oProfit = oRevenue.minus(oCost);
        const aReturnedLines = aLedger.filter((oLine) => oLine.kind === 'returned');

        return {
            Year,
            CompletedOrders: aCompleted.length,
            ItemsSold: aCompleted.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0),
            Revenue: oRevenue.toNumber(),
            GrossRevenue: oGrossRevenue.toNumber(),
            Cost: oCost.toNumber(),
            Profit: oProfit.toNumber(),
            Margin: this.margin(oProfit, oRevenue),
            Purchases: this.sumEntries(Entries).toNumber(),
            ItemsWithoutCost: aLedger.filter((oLine) => oLine.kind === 'sale' && oLine.missingCost).length,
            ReturnsCount: Returns.length,
            ReturnedItems: aReturnedLines.reduce((iTotal, oLine) => iTotal + oLine.quantity, 0),
            RefundedAmount: oRefunded.toNumber(),
            ExchangedAmount: oExchanged.toNumber(),
            AverageTicket: aCompleted.length ? oRevenue.dividedBy(aCompleted.length).toDecimalPlaces(2).toNumber() : 0,
            OpenOrders: aOpen.length,
            OpenAmount: this.sumAmounts(aOpen).toNumber(),
            CancelledOrders: Orders.filter((oOrder) => oOrder.Status === OrderStatus.Cancelled).length,
            CustomerArrangedDeliveries: aCompleted.filter((oOrder) => oOrder.DeliveryType === DeliveryType.CustomerArranged).length,
            Months: this.buildMonths(aCompleted, Returns, aLedger, Entries),
            TopProducts: this.rankProducts(aLedger.filter((oLine) => oLine.kind === 'sale')),
            TopReturned: this.rankProducts(aReturnedLines.map((oLine) => ({ ...oLine, revenue: oLine.revenue.negated(), cost: oLine.cost.negated() }))),
            TopCategories: this.rankCategories(aLedger)
        };

    }


    private saleLines(Orders: OrderModel[]): LedgerLine[] {

        return Orders.flatMap((oOrder) => {

            const oRatio = oOrder.SubtotalAmount.isZero() ? new Decimal(0) : oOrder.TotalAmount.dividedBy(oOrder.SubtotalAmount);

            return oOrder.Items.map((oItem): LedgerLine => ({
                kind: 'sale',
                month: this.monthOf(oOrder.CreatedAt),
                productName: oItem.ProductName,
                categoryName: oItem.CategoryName,
                quantity: oItem.Quantity,
                revenue: oItem.TotalPrice.times(oRatio),
                cost: (oItem.UnitCost ?? new Decimal(0)).times(oItem.Quantity),
                missingCost: !oItem.UnitCost
            }));

        });

    }


    private returnLines(Returns: OrderReturnModel[]): LedgerLine[] {

        return Returns.flatMap((oReturn) => oReturn.Items.map((oItem): LedgerLine => {

            const oUnitCost = oItem.UnitCost ?? new Decimal(0);
            const bReturned = oItem.IsReturned;

            return {
                kind: bReturned ? 'returned' : 'replacement',
                month: this.monthOf(oReturn.CreatedAt),
                productName: oItem.ProductName,
                categoryName: oItem.CategoryName,
                quantity: bReturned ? -oItem.Quantity : oItem.Quantity,
                revenue: bReturned ? oItem.TotalPrice.negated() : oItem.TotalPrice,
                cost: bReturned ? (oItem.Restock ? oUnitCost.times(oItem.Quantity).negated() : new Decimal(0)) : oUnitCost.times(oItem.Quantity),
                missingCost: !oItem.UnitCost
            };

        }));

    }


    private buildMonths(Orders: OrderModel[], Returns: OrderReturnModel[], Ledger: LedgerLine[], Entries: StockEntryModel[]): MonthlySales[] {

        return Array.from({ length: MONTHS_IN_YEAR }, (_, iIndex) => {

            const aMonthOrders = Orders.filter((oOrder) => this.monthOf(oOrder.CreatedAt) === iIndex);
            const aMonthReturns = Returns.filter((oReturn) => this.monthOf(oReturn.CreatedAt) === iIndex);
            const oRefunds = this.sumReturns(aMonthReturns, 'RefundAmount');
            const oRevenue = this.sumAmounts(aMonthOrders).minus(oRefunds).plus(this.sumReturns(aMonthReturns, 'ExchangeAmount'));
            const oCost = this.sum(Ledger.filter((oLine) => oLine.month === iIndex), (oLine) => oLine.cost);

            return {
                Month: iIndex + 1,
                Orders: aMonthOrders.length,
                Items: aMonthOrders.reduce((iTotal, oOrder) => iTotal + this.countItems(oOrder), 0),
                Revenue: oRevenue.toNumber(),
                Refunds: oRefunds.toNumber(),
                Cost: oCost.toNumber(),
                Profit: oRevenue.minus(oCost).toNumber(),
                Purchases: this.sumEntries(Entries.filter((oEntry) => this.monthOf(oEntry.CreatedAt) === iIndex)).toNumber()
            };

        });

    }


    private rankProducts(Lines: LedgerLine[]): ProductSales[] {

        return [...this.groupBy(Lines, (oLine) => oLine.productName)]
            .sort(([, oFirst], [, oSecond]) => oSecond.quantity - oFirst.quantity || oSecond.revenue.comparedTo(oFirst.revenue))
            .slice(0, TOP_PRODUCTS_LIMIT)
            .map(([sProductName, oTotal]) => ({
                ProductName: sProductName,
                Quantity: oTotal.quantity,
                Revenue: oTotal.revenue.toDecimalPlaces(2).toNumber(),
                Cost: oTotal.cost.toDecimalPlaces(2).toNumber(),
                Profit: oTotal.revenue.minus(oTotal.cost).toDecimalPlaces(2).toNumber()
            }));

    }


    private rankCategories(Lines: LedgerLine[]): CategorySales[] {

        return [...this.groupBy(Lines, (oLine) => oLine.categoryName ?? '')]
            .sort(([, oFirst], [, oSecond]) => oSecond.revenue.comparedTo(oFirst.revenue))
            .map(([sCategoryName, oTotal]) => ({
                CategoryName: sCategoryName,
                Quantity: oTotal.quantity,
                Revenue: oTotal.revenue.toDecimalPlaces(2).toNumber(),
                Profit: oTotal.revenue.minus(oTotal.cost).toDecimalPlaces(2).toNumber()
            }));

    }


    private groupBy(Lines: LedgerLine[], Key: (Line: LedgerLine) => string): Map<string, Totals> {

        const oTotals = new Map<string, Totals>();

        Lines.forEach((oLine) => {

            const sKey = Key(oLine);
            const oCurrent = oTotals.get(sKey) ?? { quantity: 0, revenue: new Decimal(0), cost: new Decimal(0) };

            oTotals.set(sKey, {
                quantity: oCurrent.quantity + oLine.quantity,
                revenue: oCurrent.revenue.plus(oLine.revenue),
                cost: oCurrent.cost.plus(oLine.cost)
            });

        });

        return oTotals;

    }


    private margin(Profit: Decimal, Revenue: Decimal): number {

        return Revenue.greaterThan(0) ? Profit.dividedBy(Revenue).times(PERCENT).toDecimalPlaces(2).toNumber() : 0;

    }


    private sum(Lines: LedgerLine[], Value: (Line: LedgerLine) => Decimal): Decimal {

        return Lines.reduce((oTotal, oLine) => oTotal.plus(Value(oLine)), new Decimal(0)).toDecimalPlaces(2);

    }


    private sumEntries(Entries: StockEntryModel[]): Decimal {

        return Entries.reduce((oTotal, oEntry) => oTotal.plus(oEntry.TotalCost), new Decimal(0));

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
