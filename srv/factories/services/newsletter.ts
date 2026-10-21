import path from 'path';
import { NewsletterService } from '@/services/newsletter';
import { NewsletterServiceImplementation } from '@/services/newsletter/implementation';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { oSubscriberRepositoryFactory } from '../repositories/subscriber';
import { oNewsletterCampaignRepositoryFactory } from '../repositories/newsletter-campaign';
import { oStoreSettingsServiceFactory } from './store-settings';
import { oEmailServerServiceFactory } from './email-server';

const TEMPLATES_DIRECTORY = path.join(__dirname, '../../services/newsletter/templates');

const makeNewsletterService = (): NewsletterService => {

    return new NewsletterServiceImplementation(
        oSubscriberRepositoryFactory,
        oNewsletterCampaignRepositoryFactory,
        oStoreSettingsServiceFactory,
        new TemplateRenderer(TEMPLATES_DIRECTORY),
        oEmailServerServiceFactory,
        TEMPLATES_DIRECTORY
    );

};

export const oNewsletterServiceFactory = makeNewsletterService();
