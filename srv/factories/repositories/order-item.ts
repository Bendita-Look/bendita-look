import { OrderItemRepository } from '@/repositories/order-item';
import { OrderItemRepositoryImplementation } from '@/repositories/order-item/implementation';

const makeOrderItemRepository = (): OrderItemRepository => {

    return new OrderItemRepositoryImplementation();

};

export const oOrderItemRepositoryFactory = makeOrderItemRepository();
