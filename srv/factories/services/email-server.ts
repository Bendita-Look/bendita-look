import { EmailServerService } from '@/services/email-server';
import { EmailServerServiceImplementation } from '@/services/email-server/implementation';
import { oEmailServerRepositoryFactory } from '../repositories/email-server';
import { oStoreSettingsServiceFactory } from './store-settings';

const makeEmailServerService = (): EmailServerService => {

    return new EmailServerServiceImplementation(oEmailServerRepositoryFactory, oStoreSettingsServiceFactory);

};

export const oEmailServerServiceFactory = makeEmailServerService();
