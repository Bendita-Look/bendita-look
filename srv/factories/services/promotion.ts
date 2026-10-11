import { PromotionService } from '@/services/promotion';
import { PromotionServiceImplementation } from '@/services/promotion/implementation';
import { oPromotionRepositoryFactory } from '../repositories/promotion';

const makePromotionService = (): PromotionService => {

    return new PromotionServiceImplementation(oPromotionRepositoryFactory);

};

export const oPromotionServiceFactory = makePromotionService();
