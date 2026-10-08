import { OrderRoute } from '@/routes/order/index';
import { OrderRouteImplementation } from '@/routes/order/implementation';
import { oOrderControllerFactory } from '../controllers/order';

const makeOrderRoute = (): OrderRoute => {

    return new OrderRouteImplementation(oOrderControllerFactory);

};

export const oOrderRouteFactory = makeOrderRoute();
