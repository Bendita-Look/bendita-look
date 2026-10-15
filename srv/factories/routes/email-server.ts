import { EmailServerRoute } from '@/routes/email-server/index';
import { EmailServerRouteImplementation } from '@/routes/email-server/implementation';
import { oEmailServerControllerFactory } from '../controllers/email-server';

const makeEmailServerRoute = (): EmailServerRoute => {

    return new EmailServerRouteImplementation(oEmailServerControllerFactory);

};

export const oEmailServerRouteFactory = makeEmailServerRoute();
