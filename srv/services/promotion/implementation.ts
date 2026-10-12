import { User } from '@sap/cds';
import { ActivePromotion, Promotion } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, ValidationError } from '@/errors';
import { PromotionReward, PromotionScope } from '@/constants/promotions';
import { PromotionRepository } from '@/repositories/promotion';
import { StoreCalendar } from '@/infrastructure/StoreCalendar';
import { PromotionService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const COUPON_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const MAX_PERCENT = 100;
const MIN_CHEAPEST_FREE_QUANTITY = 2;

export class PromotionServiceImplementation extends BaseServiceImplementation<Promotion> implements PromotionService {

    constructor(public readonly Repository: PromotionRepository) {

        super();

    }


    public async beforeCreate(Promotion: Promotion, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Promotion);

    }


    public async beforeUpdate(Promotion: Promotion, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Promotion);

    }


    public async activePromotions(): Promise<Either<AbstractError, ActivePromotion[]>> {

        return this.execute(async () => {

            const sToday = StoreCalendar.today();
            const aPromotions = await this.Repository.findActive();

            return right(aPromotions
                .filter((oPromotion) => !oPromotion.IsCoupon && oPromotion.isValidOn(sToday))
                .map((oPromotion) => ({ Name: oPromotion.Name, Description: oPromotion.Description })));

        });

    }


    private async validate(Promotion: Promotion): Promise<Either<AbstractError, boolean>> {

        const oRules = this.validateRules(Promotion);

        if (oRules.isLeft()) {
            return oRules;
        }

        if (!Promotion.CouponCode) {
            return right(true);
        }

        return this.execute(async () => {

            const iDuplicates = await this.Repository.countByCouponCode(Promotion.CouponCode as string, Promotion.ID as string);

            return iDuplicates > 0
                ? left(new ConflictError('error.duplicatedCouponCode', { code: Promotion.CouponCode as string }))
                : right(true);

        });

    }


    private validateRules(Promotion: Promotion): Either<AbstractError, boolean> {

        const iMinQuantity = Promotion.MinQuantity ?? 1;
        const nRewardValue = Number(Promotion.RewardValue ?? 0);

        if (this.isBlank(Promotion.Name)) {
            return left(new ValidationError('error.promotionNameRequired'));
        }

        if (!Object.values(PromotionReward).includes(Promotion.RewardType as PromotionReward)) {
            return left(new ValidationError('error.promotionRewardRequired'));
        }

        if (Promotion.Scope === PromotionScope.Category && !Promotion.Category_ID) {
            return left(new ValidationError('error.promotionCategoryRequired'));
        }

        if (Promotion.Scope === PromotionScope.Product && !Promotion.Product_ID) {
            return left(new ValidationError('error.promotionProductRequired'));
        }

        if (!Number.isInteger(iMinQuantity) || iMinQuantity < 1) {
            return left(new ValidationError('error.promotionInvalidMinQuantity'));
        }

        if (Promotion.MinAmount !== null && Promotion.MinAmount !== undefined && Number(Promotion.MinAmount) < 0) {
            return left(new ValidationError('error.promotionInvalidMinAmount'));
        }

        if (Promotion.RewardType === PromotionReward.PercentDiscount && !(nRewardValue > 0 && nRewardValue <= MAX_PERCENT)) {
            return left(new ValidationError('error.promotionInvalidPercent'));
        }

        if (Promotion.RewardType === PromotionReward.FixedDiscount && !(nRewardValue > 0)) {
            return left(new ValidationError('error.promotionInvalidAmount'));
        }

        if (Promotion.MaxDiscount !== null && Promotion.MaxDiscount !== undefined && !(Number(Promotion.MaxDiscount) > 0)) {
            return left(new ValidationError('error.promotionInvalidMaxDiscount'));
        }

        if (Promotion.RewardType === PromotionReward.Gift && this.isBlank(Promotion.GiftDescription)) {
            return left(new ValidationError('error.promotionGiftRequired'));
        }

        if (Promotion.RewardType === PromotionReward.CheapestFree && iMinQuantity < MIN_CHEAPEST_FREE_QUANTITY) {
            return left(new ValidationError('error.promotionCheapestFreeQuantity', { min: MIN_CHEAPEST_FREE_QUANTITY }));
        }

        if (Promotion.StartDate && Promotion.EndDate && Promotion.StartDate > Promotion.EndDate) {
            return left(new ValidationError('error.promotionInvalidPeriod'));
        }

        if (Promotion.CouponCode && !COUPON_PATTERN.test(Promotion.CouponCode)) {
            return left(new ValidationError('error.invalidCouponCode'));
        }

        if (Promotion.MaxUses !== null && Promotion.MaxUses !== undefined && !(Number.isInteger(Promotion.MaxUses) && Promotion.MaxUses >= 1)) {
            return left(new ValidationError('error.promotionInvalidMaxUses'));
        }

        return right(true);

    }

}
