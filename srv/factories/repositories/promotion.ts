import { PromotionRepository } from '@/repositories/promotion';
import { PromotionRepositoryImplementation } from '@/repositories/promotion/implementation';

const makePromotionRepository = (): PromotionRepository => {

    return new PromotionRepositoryImplementation();

};

export const oPromotionRepositoryFactory = makePromotionRepository();
