import { OrderPromotion, OrderPromotions } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { PromotionReward } from '@/constants/promotions';
import { BaseModel } from './base';

export type OrderPromotionProperties = {
    Id: string;
    OrderId: string;
    PromotionId?: string;
    PromotionName: string;
    RewardType: PromotionReward;
    DiscountAmount: Decimal;
    GiftDescription?: string;
    CouponCode?: string;
};

export class OrderPromotionModel extends BaseModel {

    constructor(private readonly properties: OrderPromotionProperties) { super(); }

    public static with(properties: OrderPromotionProperties): OrderPromotionModel {
        return new OrderPromotionModel(properties);
    }

    public static mapModel(Promotions: OrderPromotions): OrderPromotionModel[] {

        return Promotions.map((Promotion: OrderPromotion) => OrderPromotionModel.with({
            Id: Promotion.ID as string,
            OrderId: Promotion.Order_ID as string,
            PromotionId: Promotion.Promotion_ID ?? undefined,
            PromotionName: Promotion.PromotionName as string,
            RewardType: Promotion.RewardType as PromotionReward,
            DiscountAmount: this.retrieveDecimal(Promotion.DiscountAmount),
            GiftDescription: Promotion.GiftDescription ?? undefined,
            CouponCode: Promotion.CouponCode ?? undefined
        }));

    }

    public get Id() { return this.properties.Id; }

    public get PromotionId() { return this.properties.PromotionId; }

    public get PromotionName() { return this.properties.PromotionName; }

    public get RewardType() { return this.properties.RewardType; }

    public get DiscountAmount() { return this.properties.DiscountAmount; }

    public get GiftDescription() { return this.properties.GiftDescription; }

    public get CouponCode() { return this.properties.CouponCode; }

    public toEntityObject(): OrderPromotion {

        return this.cleanEntity({
            ID: this.properties.Id,
            Order_ID: this.properties.OrderId,
            Promotion_ID: this.properties.PromotionId,
            PromotionName: this.properties.PromotionName,
            RewardType: this.properties.RewardType,
            DiscountAmount: this.properties.DiscountAmount.toNumber(),
            GiftDescription: this.properties.GiftDescription,
            CouponCode: this.properties.CouponCode
        });

    }

}
