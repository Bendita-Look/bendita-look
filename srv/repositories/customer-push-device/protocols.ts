import { CustomerPushDeviceModel } from '@/models/customer-push-device';
import { BaseRepository } from '../base';

export interface CustomerPushDeviceRepository extends BaseRepository<CustomerPushDeviceModel> {
    findByEndpoint(Endpoint: string): Promise<CustomerPushDeviceModel | null>;
    findByOrder(OrderId: string): Promise<CustomerPushDeviceModel[]>;
    removeByEndpoint(Endpoint: string): Promise<void>;
    removeOrphans(): Promise<void>;
}
