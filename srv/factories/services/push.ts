import { PushService } from '@/services/push';
import { PushServiceImplementation } from '@/services/push/implementation';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { ORDER_PUSH_LIMITS } from '@/constants/order-limits';
import { oCustomerPushDeviceRepositoryFactory } from '../repositories/customer-push-device';
import { oCustomerPushOrderRepositoryFactory } from '../repositories/customer-push-order';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oPushSubscriptionRepositoryFactory } from '../repositories/push-subscription';
import { oStoreSettingsServiceFactory } from './store-settings';

const makePushService = (): PushService => {

    return new PushServiceImplementation(
        oPushSubscriptionRepositoryFactory,
        oCustomerPushDeviceRepositoryFactory,
        oCustomerPushOrderRepositoryFactory,
        oOrderRepositoryFactory,
        oStoreSettingsServiceFactory,
        new RateLimiter(ORDER_PUSH_LIMITS.maxRequestsPerWindow, ORDER_PUSH_LIMITS.windowInMinutes)
    );

};

export const oPushServiceFactory = makePushService();
