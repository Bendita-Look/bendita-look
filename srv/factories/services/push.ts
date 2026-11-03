import { PushService } from '@/services/push';
import { PushServiceImplementation } from '@/services/push/implementation';
import { oPushSubscriptionRepositoryFactory } from '../repositories/push-subscription';
import { oStoreSettingsServiceFactory } from './store-settings';

const makePushService = (): PushService => {

    return new PushServiceImplementation(oPushSubscriptionRepositoryFactory, oStoreSettingsServiceFactory);

};

export const oPushServiceFactory = makePushService();
