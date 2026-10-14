import { OrderReturnController } from '@/controllers/order-return';
import { OrderReturnControllerImplementation } from '@/controllers/order-return/implementation';
import { oOrderReturnServiceFactory } from '../services/order-return';

const makeOrderReturnController = (): OrderReturnController => {

    return new OrderReturnControllerImplementation(oOrderReturnServiceFactory);

};

export const oOrderReturnControllerFactory = makeOrderReturnController();
