import path from 'path';
import { NotificationService } from '@/services/notification';
import { NotificationServiceImplementation } from '@/services/notification/implementation';
import { EmailSender } from '@/infrastructure/EmailSender';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { oStoreSettingsServiceFactory } from './store-settings';

const makeNotificationService = (): NotificationService => {

    return new NotificationServiceImplementation(
        new EmailSender(),
        new TemplateRenderer(path.join(__dirname, '../../services/notification/templates')),
        oStoreSettingsServiceFactory
    );

};

export const oNotificationServiceFactory = makeNotificationService();
