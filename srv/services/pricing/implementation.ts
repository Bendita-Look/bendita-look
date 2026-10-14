import Decimal from 'decimal.js';
import { Either, left, right } from '@sweet-monads/either';
import { OrderQuote } from '@models/apps/dflc/benditalook/entities';
import { AbstractError, NotFoundError } from '@/errors';
import { CouponStatus, PromotionReward, PromotionScope } from '@/constants/promotions';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { PromotionModel } from '@/models/promotion';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { PromotionRepository } from '@/repositories/promotion';
import { Messages } from '@/infrastructure/Messages';
import { StoreCalendar } from '@/infrastructure/StoreCalendar';
import { RequestedItem } from '@/services/order/input-validator';
import { PricedLine, PricedPromotion, PriceQuote, PricingService, QuoteOptions } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const PERCENT = 100;

type CouponEvaluation = {
    status: CouponStatus;
    promotion?: PricedPromotion;
};

export class PricingServiceImplementation extends BaseServiceImplementation<OrderQuote> implements PricingService {

    constructor(
        private readonly VariantRepository: ProductVariantRepository,
        private readonly PromotionRepository: PromotionRepository
    ) {

        super();

    }


    public async quote(Items: RequestedItem[], CouponCode?: string, Options: QuoteOptions = {}): Promise<Either<AbstractError, PriceQuote>> {

        return this.execute(async () => {

            const oLines = await this.priceLines(Items);

            if (oLines.isLeft()) {
                return left(oLines.value);
            }

            const aLines = oLines.value;
            const sToday = StoreCalendar.today();
            const aPromotions = (await this.PromotionRepository.findActive()).filter((oPromotion) => oPromotion.isValidOn(sToday));
            const aAutomatic = aPromotions
                .filter((oPromotion) => !oPromotion.IsCoupon)
                .map((oPromotion) => this.evaluate(oPromotion, aLines))
                .filter((oPriced): oPriced is PricedPromotion => Boolean(oPriced));

            const oCoupon = CouponCode ? await this.evaluateCoupon(CouponCode, aLines, sToday, Boolean(Options.couponReserved)) : undefined;

            return right(this.buildQuote(aLines, aAutomatic, oCoupon, CouponCode));

        });

    }


    public async priceItems(Items: RequestedItem[]): Promise<Either<AbstractError, PricedLine[]>> {

        return this.execute(() => this.priceLines(Items));

    }


    public toOrderQuote(Quote: PriceQuote, Locale: string | undefined): OrderQuote {

        return {
            SubtotalAmount: Quote.subtotal.toNumber(),
            DiscountAmount: Quote.discount.toNumber(),
            TotalAmount: Quote.total.toNumber(),
            CouponCode: Quote.couponCode,
            CouponStatus: Quote.couponStatus,
            CouponMessage: Quote.couponStatus ? Messages.text(`coupon.${Quote.couponStatus}`, Locale) : undefined,
            Lines: Quote.lines.map((oLine) => ({
                Variant_ID: oLine.variant.Id,
                ProductName: oLine.variant.ProductName,
                ColorName: oLine.variant.ColorName,
                Size: oLine.variant.Size,
                Quantity: oLine.quantity,
                UnitPrice: oLine.variant.Price.toNumber(),
                TotalPrice: oLine.total.toNumber()
            })),
            Promotions: Quote.promotions.map((oPriced) => ({
                PromotionName: oPriced.promotion.Name,
                RewardType: oPriced.promotion.RewardType,
                DiscountAmount: oPriced.discount.toNumber(),
                GiftDescription: oPriced.promotion.GiftDescription,
                CouponCode: oPriced.promotion.CouponCode
            }))
        };

    }


    private async priceLines(Items: RequestedItem[]): Promise<Either<AbstractError, PricedLine[]>> {

        const aVariants = await this.VariantRepository.findOrderableByIds(Items.map((oItem) => oItem.VariantId));
        const oVariants = new Map(aVariants.map((oVariant) => [oVariant.Id, oVariant]));

        if (Items.some((oItem) => !oVariants.get(oItem.VariantId)?.ProductActive)) {
            return left(new NotFoundError('error.productUnavailable'));
        }

        return right(Items.map((oItem) => {

            const oVariant = oVariants.get(oItem.VariantId) as OrderableVariantModel;

            return { variant: oVariant, quantity: oItem.Quantity, total: oVariant.Price.times(oItem.Quantity) };

        }));

    }


    private async evaluateCoupon(CouponCode: string, Lines: PricedLine[], Today: string, Reserved: boolean): Promise<CouponEvaluation> {

        const oPromotion = await this.PromotionRepository.findByCouponCode(CouponCode);

        if (!oPromotion || !oPromotion.isValidOn(Today)) {
            return { status: CouponStatus.NotFound };
        }

        if (!Reserved && !oPromotion.HasUsesLeft) {
            return { status: CouponStatus.Exhausted };
        }

        const oPriced = this.evaluate(oPromotion, Lines);

        return oPriced ? { status: CouponStatus.Applied, promotion: oPriced } : { status: CouponStatus.NotEligible };

    }


    private buildQuote(Lines: PricedLine[], Automatic: PricedPromotion[], Coupon: CouponEvaluation | undefined, CouponCode?: string): PriceQuote {

        const oSubtotal = Lines.reduce((oTotal, oLine) => oTotal.plus(oLine.total), new Decimal(0));
        const aGifts = Automatic.filter((oPriced) => !oPriced.promotion.IsDiscount);
        const oBestAutomatic = this.bestDiscount(Automatic.filter((oPriced) => oPriced.promotion.IsDiscount));
        const oCouponPromotion = Coupon?.promotion;

        let eCouponStatus = Coupon?.status;
        let oDiscount = oBestAutomatic;

        if (oCouponPromotion && !oCouponPromotion.promotion.IsDiscount) {
            aGifts.push(oCouponPromotion);
        } else if (oCouponPromotion && oBestAutomatic && oCouponPromotion.discount.lessThan(oBestAutomatic.discount)) {
            eCouponStatus = CouponStatus.NotBetter;
        } else if (oCouponPromotion) {
            oDiscount = oCouponPromotion;
        }

        const aApplied = [...(oDiscount ? [oDiscount] : []), ...aGifts];
        const oDiscountAmount = Decimal.min(oDiscount?.discount ?? new Decimal(0), oSubtotal).toDecimalPlaces(2);
        const bCouponApplied = eCouponStatus === CouponStatus.Applied;

        return {
            lines: Lines,
            subtotal: oSubtotal.toDecimalPlaces(2),
            discount: oDiscountAmount,
            total: oSubtotal.minus(oDiscountAmount).toDecimalPlaces(2),
            promotions: aApplied,
            couponCode: bCouponApplied ? CouponCode : undefined,
            couponStatus: eCouponStatus
        };

    }


    private evaluate(Promotion: PromotionModel, Lines: PricedLine[]): PricedPromotion | undefined {

        const aEligible = Lines.filter((oLine) => this.isEligible(Promotion, oLine.variant));
        const iQuantity = aEligible.reduce((iTotal, oLine) => iTotal + oLine.quantity, 0);
        const oAmount = aEligible.reduce((oTotal, oLine) => oTotal.plus(oLine.total), new Decimal(0));

        if (!iQuantity || iQuantity < Promotion.MinQuantity || (Promotion.MinAmount && oAmount.lessThan(Promotion.MinAmount))) {
            return undefined;
        }

        return { promotion: Promotion, discount: this.limitDiscount(Promotion, this.discountFor(Promotion, aEligible, oAmount)).toDecimalPlaces(2) };

    }


    private discountFor(Promotion: PromotionModel, Eligible: PricedLine[], EligibleAmount: Decimal): Decimal {

        switch (Promotion.RewardType) {

            case PromotionReward.PercentDiscount:
                return EligibleAmount.times(Decimal.min(Promotion.RewardValue, PERCENT)).dividedBy(PERCENT);

            case PromotionReward.FixedDiscount:
                return Decimal.min(Promotion.RewardValue, EligibleAmount);

            case PromotionReward.CheapestFree:
                return this.cheapestUnitsTotal(Eligible, Promotion.MinQuantity);

            default:
                return new Decimal(0);

        }

    }


    private limitDiscount(Promotion: PromotionModel, Discount: Decimal): Decimal {

        return Promotion.MaxDiscount ? Decimal.min(Discount, Promotion.MaxDiscount) : Discount;

    }


    private cheapestUnitsTotal(Eligible: PricedLine[], GroupSize: number): Decimal {

        const aUnitPrices = Eligible
            .flatMap((oLine) => Array.from({ length: oLine.quantity }, () => oLine.variant.Price))
            .sort((oFirst, oSecond) => oFirst.comparedTo(oSecond));

        const iFreeUnits = Math.floor(aUnitPrices.length / GroupSize);

        return aUnitPrices.slice(0, iFreeUnits).reduce((oTotal, oPrice) => oTotal.plus(oPrice), new Decimal(0));

    }


    private isEligible(Promotion: PromotionModel, Variant: OrderableVariantModel): boolean {

        switch (Promotion.Scope) {

            case PromotionScope.Category:
                return Variant.CategoryId === Promotion.CategoryId;

            case PromotionScope.Product:
                return Variant.ProductId === Promotion.ProductId;

            default:
                return true;

        }

    }


    private bestDiscount(Promotions: PricedPromotion[]): PricedPromotion | undefined {

        return Promotions
            .filter((oPriced) => oPriced.discount.greaterThan(0))
            .sort((oFirst, oSecond) => oSecond.discount.comparedTo(oFirst.discount))[0];

    }

}
