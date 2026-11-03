import { PushSubscriptionRepository } from '@/repositories/push-subscription';
import { PushSubscriptionRepositoryImplementation } from '@/repositories/push-subscription/implementation';

const makePushSubscriptionRepository = (): PushSubscriptionRepository => {

    return new PushSubscriptionRepositoryImplementation();

};

export const oPushSubscriptionRepositoryFactory = makePushSubscriptionRepository();
