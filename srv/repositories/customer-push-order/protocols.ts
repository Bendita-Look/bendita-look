import { CustomerPushOrderModel } from '@/models/customer-push-order';
import { BaseRepository } from '../base';

export interface CustomerPushOrderRepository extends BaseRepository<CustomerPushOrderModel> {
    replaceForDevice(DeviceId: string, OrderIds: string[]): Promise<void>;
    removeByOrder(OrderId: string): Promise<void>;
}
