import { OrderPromotionRepository } from '@/repositories/order-promotion';
import { OrderPromotionRepositoryImplementation } from '@/repositories/order-promotion/implementation';

const makeOrderPromotionRepository = (): OrderPromotionRepository => {

    return new OrderPromotionRepositoryImplementation();

};

export const oOrderPromotionRepositoryFactory = makeOrderPromotionRepository();
