import { OrderReturnRoute } from '@/routes/order-return/index';
import { OrderReturnRouteImplementation } from '@/routes/order-return/implementation';
import { oOrderReturnControllerFactory } from '../controllers/order-return';

const makeOrderReturnRoute = (): OrderReturnRoute => {

    return new OrderReturnRouteImplementation(oOrderReturnControllerFactory);

};

export const oOrderReturnRouteFactory = makeOrderReturnRoute();
