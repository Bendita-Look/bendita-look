import { OrderReturnItemRepository } from '@/repositories/order-return-item';
import { OrderReturnItemRepositoryImplementation } from '@/repositories/order-return-item/implementation';

const makeOrderReturnItemRepository = (): OrderReturnItemRepository => {

    return new OrderReturnItemRepositoryImplementation();

};

export const oOrderReturnItemRepositoryFactory = makeOrderReturnItemRepository();
