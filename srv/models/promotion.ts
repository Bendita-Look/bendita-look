import { Promotion, Promotions } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { PromotionReward, PromotionScope } from '@/constants/promotions';
import { AuditProperties, BaseModel } from './base';

type DateString = NonNullable<Promotion['StartDate']>;

export type PromotionProperties = AuditProperties & {
    Id: string;
    Name: string;
    Description?: string;
    Active: boolean;
    StartDate?: DateString;
    EndDate?: DateString;
    Scope: PromotionScope;
    CategoryId?: string;
    ProductId?: string;
    MinQuantity: number;
    MinAmount?: Decimal;
    RewardType: PromotionReward;
    RewardValue?: Decimal;
    MaxDiscount?: Decimal;
    GiftDescription?: string;
    CouponCode?: string;
    MaxUses?: number;
    UsedCount: number;
};

export class PromotionModel extends BaseModel {

    constructor(private readonly properties: PromotionProperties) { super(); }

    public static with(properties: PromotionProperties): PromotionModel {
        return new PromotionModel(properties);
    }

    public static mapModel(Promotions: Promotions): PromotionModel[] {

        return Promotions.map((Promotion: Promotion) => PromotionModel.with({
            Id: Promotion.ID as string,
            Name: Promotion.Name as string,
            Description: Promotion.Description ?? undefined,
            Active: Promotion.Active !== false,
            StartDate: Promotion.StartDate ?? undefined,
            EndDate: Promotion.EndDate ?? undefined,
            Scope: (Promotion.Scope as PromotionScope) ?? PromotionScope.AllItems,
            CategoryId: Promotion.Category_ID ?? undefined,
            ProductId: Promotion.Product_ID ?? undefined,
            MinQuantity: Promotion.MinQuantity ?? 1,
            MinAmount: Promotion.MinAmount !== null && Promotion.MinAmount !== undefined ? this.retrieveDecimal(Promotion.MinAmount) : undefined,
            RewardType: Promotion.RewardType as PromotionReward,
            RewardValue: Promotion.RewardValue !== null && Promotion.RewardValue !== undefined ? this.retrieveDecimal(Promotion.RewardValue) : undefined,
            MaxDiscount: Promotion.MaxDiscount !== null && Promotion.MaxDiscount !== undefined ? this.retrieveDecimal(Promotion.MaxDiscount) : undefined,
            GiftDescription: Promotion.GiftDescription ?? undefined,
            CouponCode: Promotion.CouponCode ?? undefined,
            MaxUses: Promotion.MaxUses ?? undefined,
            UsedCount: Promotion.UsedCount ?? 0,
            ...this.retrieveAudit(Promotion)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Name() { return this.properties.Name; }

    public get Description() { return this.properties.Description; }

    public get Active() { return this.properties.Active; }

    public get StartDate() { return this.properties.StartDate; }

    public get EndDate() { return this.properties.EndDate; }

    public get Scope() { return this.properties.Scope; }

    public get CategoryId() { return this.properties.CategoryId; }

    public get ProductId() { return this.properties.ProductId; }

    public get MinQuantity() { return Math.max(this.properties.MinQuantity, 1); }

    public get MinAmount() { return this.properties.MinAmount; }

    public get RewardType() { return this.properties.RewardType; }

    public get RewardValue() { return this.properties.RewardValue ?? new Decimal(0); }

    public get MaxDiscount() { return this.properties.MaxDiscount; }

    public get GiftDescription() { return this.properties.GiftDescription; }

    public get CouponCode() { return this.properties.CouponCode; }

    public get IsCoupon() { return Boolean(this.properties.CouponCode); }

    public get IsDiscount() { return this.properties.RewardType !== PromotionReward.Gift; }

    public get HasUsesLeft() {

        return this.properties.MaxUses === undefined || this.properties.UsedCount < this.properties.MaxUses;

    }

    public isValidOn(Day: string): boolean {

        return this.properties.Active
            && (!this.properties.StartDate || this.properties.StartDate <= Day)
            && (!this.properties.EndDate || this.properties.EndDate >= Day);

    }

    public toEntityObject(): Promotion {

        return this.cleanEntity({
            ID: this.properties.Id,
            Name: this.properties.Name,
            Description: this.properties.Description,
            Active: this.properties.Active,
            StartDate: this.properties.StartDate,
            EndDate: this.properties.EndDate,
            Scope: this.properties.Scope,
            Category_ID: this.properties.CategoryId,
            Product_ID: this.properties.ProductId,
            MinQuantity: this.properties.MinQuantity,
            MinAmount: this.properties.MinAmount?.toNumber(),
            RewardType: this.properties.RewardType,
            RewardValue: this.properties.RewardValue?.toNumber(),
            MaxDiscount: this.properties.MaxDiscount?.toNumber(),
            GiftDescription: this.properties.GiftDescription,
            CouponCode: this.properties.CouponCode,
            MaxUses: this.properties.MaxUses,
            UsedCount: this.properties.UsedCount,
            ...this.auditEntityObject(this.properties)
        });

    }

}
