import { PromotionRoute } from '@/routes/promotion/index';
import { PromotionRouteImplementation } from '@/routes/promotion/implementation';
import { oPromotionControllerFactory } from '../controllers/promotion';

const makePromotionRoute = (): PromotionRoute => {

    return new PromotionRouteImplementation(oPromotionControllerFactory);

};

export const oPromotionRouteFactory = makePromotionRoute();
