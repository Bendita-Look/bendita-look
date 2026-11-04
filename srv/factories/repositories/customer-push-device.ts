import { CustomerPushDeviceRepository } from '@/repositories/customer-push-device';
import { CustomerPushDeviceRepositoryImplementation } from '@/repositories/customer-push-device/implementation';

const makeCustomerPushDeviceRepository = (): CustomerPushDeviceRepository => {

    return new CustomerPushDeviceRepositoryImplementation();

};

export const oCustomerPushDeviceRepositoryFactory = makeCustomerPushDeviceRepository();
