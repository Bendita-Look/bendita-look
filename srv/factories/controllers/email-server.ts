import { EmailServerController } from '@/controllers/email-server';
import { EmailServerControllerImplementation } from '@/controllers/email-server/implementation';
import { oEmailServerServiceFactory } from '../services/email-server';

const makeEmailServerController = (): EmailServerController => {

    return new EmailServerControllerImplementation(oEmailServerServiceFactory);

};

export const oEmailServerControllerFactory = makeEmailServerController();
