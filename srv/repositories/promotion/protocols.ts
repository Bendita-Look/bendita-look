import { PromotionModel } from '@/models/promotion';
import { BaseRepository } from '../base';

export interface PromotionRepository extends BaseRepository<PromotionModel> {
    findActive(): Promise<PromotionModel[]>;
    findByCouponCode(CouponCode: string): Promise<PromotionModel | null>;
    countByCouponCode(CouponCode: string, ExcludedId: string): Promise<number>;
    consumeCoupon(Id: string): Promise<boolean>;
    releaseCoupon(Id: string): Promise<void>;
}
