import { PushController } from '@/controllers/push';
import { PushControllerImplementation } from '@/controllers/push/implementation';
import { oPushServiceFactory } from '../services/push';

const makePushController = (): PushController => {

    return new PushControllerImplementation(oPushServiceFactory);

};

export const oPushControllerFactory = makePushController();
