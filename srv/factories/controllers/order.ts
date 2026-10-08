import { OrderController } from '@/controllers/order';
import { OrderControllerImplementation } from '@/controllers/order/implementation';
import { oOrderServiceFactory } from '../services/order';

const makeOrderController = (): OrderController => {

    return new OrderControllerImplementation(oOrderServiceFactory);

};

export const oOrderControllerFactory = makeOrderController();
