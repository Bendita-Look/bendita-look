import { CustomerPushOrderRepository } from '@/repositories/customer-push-order';
import { CustomerPushOrderRepositoryImplementation } from '@/repositories/customer-push-order/implementation';

const makeCustomerPushOrderRepository = (): CustomerPushOrderRepository => {

    return new CustomerPushOrderRepositoryImplementation();

};

export const oCustomerPushOrderRepositoryFactory = makeCustomerPushOrderRepository();
