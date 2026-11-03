import { PushSubscriptionModel } from '@/models/push-subscription';
import { BaseRepository } from '../base';

export interface PushSubscriptionRepository extends BaseRepository<PushSubscriptionModel> {
    findActive(): Promise<PushSubscriptionModel[]>;
    findByEndpoint(Endpoint: string): Promise<PushSubscriptionModel | null>;
    removeByEndpoint(Endpoint: string): Promise<void>;
    deactivate(Endpoint: string): Promise<void>;
}
