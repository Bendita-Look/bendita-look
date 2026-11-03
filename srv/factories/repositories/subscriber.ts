import { SubscriberRepository } from '@/repositories/subscriber';
import { SubscriberRepositoryImplementation } from '@/repositories/subscriber/implementation';

const makeSubscriberRepository = (): SubscriberRepository => {

    return new SubscriberRepositoryImplementation();

};

export const oSubscriberRepositoryFactory = makeSubscriberRepository();
