import Decimal from 'decimal.js';
import { Either } from '@sweet-monads/either';
import { OrderQuote } from '@models/apps/dflc/benditalook/entities';
import { AbstractError } from '@/errors';
import { CouponStatus } from '@/constants/promotions';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { PromotionModel } from '@/models/promotion';
import { RequestedItem } from '@/services/order/input-validator';

export type PricedLine = {
    variant: OrderableVariantModel;
    quantity: number;
    total: Decimal;
};

export type PricedPromotion = {
    promotion: PromotionModel;
    discount: Decimal;
};

export type PriceQuote = {
    lines: PricedLine[];
    subtotal: Decimal;
    discount: Decimal;
    total: Decimal;
    promotions: PricedPromotion[];
    couponCode?: string;
    couponStatus?: CouponStatus;
};

export type QuoteOptions = {
    couponReserved?: boolean;
};

export interface PricingService {
    quote(Items: RequestedItem[], CouponCode?: string, Options?: QuoteOptions): Promise<Either<AbstractError, PriceQuote>>;
    priceItems(Items: RequestedItem[]): Promise<Either<AbstractError, PricedLine[]>>;
    toOrderQuote(Quote: PriceQuote, Locale: string | undefined): OrderQuote;
}
