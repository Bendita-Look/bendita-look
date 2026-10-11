import { PromotionController } from '@/controllers/promotion';
import { PromotionControllerImplementation } from '@/controllers/promotion/implementation';
import { oPromotionServiceFactory } from '../services/promotion';

const makePromotionController = (): PromotionController => {

    return new PromotionControllerImplementation(oPromotionServiceFactory);

};

export const oPromotionControllerFactory = makePromotionController();
