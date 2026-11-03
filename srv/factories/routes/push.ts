import { PushRoute } from '@/routes/push';
import { PushRouteImplementation } from '@/routes/push/implementation';
import { oPushControllerFactory } from '../controllers/push';

const makePushRoute = (): PushRoute => {

    return new PushRouteImplementation(oPushControllerFactory);

};

export const oPushRouteFactory = makePushRoute();
