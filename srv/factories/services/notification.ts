import path from 'path';
import { NotificationService } from '@/services/notification';
import { NotificationServiceImplementation } from '@/services/notification/implementation';
import { EmailSender } from '@/infrastructure/EmailSender';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { oStoreSettingsServiceFactory } from './store-settings';
import { oEmailServerServiceFactory } from './email-server';
import { oProductImageRepositoryFactory } from '../repositories/product-image';

const TEMPLATES_DIRECTORY = path.join(__dirname, '../../services/notification/templates');

const makeNotificationService = (): NotificationService => {

    return new NotificationServiceImplementation(
        new EmailSender(oEmailServerServiceFactory),
        new TemplateRenderer(TEMPLATES_DIRECTORY),
        oStoreSettingsServiceFactory,
        oProductImageRepositoryFactory,
        TEMPLATES_DIRECTORY
    );

};

export const oNotificationServiceFactory = makeNotificationService();
