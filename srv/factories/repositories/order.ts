import { OrderRepository } from '@/repositories/order';
import { OrderRepositoryImplementation } from '@/repositories/order/implementation';

const makeOrderRepository = (): OrderRepository => {

    return new OrderRepositoryImplementation();

};

export const oOrderRepositoryFactory = makeOrderRepository();
