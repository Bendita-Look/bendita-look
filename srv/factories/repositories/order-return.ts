import { OrderReturnRepository } from '@/repositories/order-return';
import { OrderReturnRepositoryImplementation } from '@/repositories/order-return/implementation';

const makeOrderReturnRepository = (): OrderReturnRepository => {

    return new OrderReturnRepositoryImplementation();

};

export const oOrderReturnRepositoryFactory = makeOrderReturnRepository();
