import { NewsletterController } from '@/controllers/newsletter';
import { NewsletterControllerImplementation } from '@/controllers/newsletter/implementation';
import { oNewsletterServiceFactory } from '../services/newsletter';

const makeNewsletterController = (): NewsletterController => {

    return new NewsletterControllerImplementation(oNewsletterServiceFactory);

};

export const oNewsletterControllerFactory = makeNewsletterController();
