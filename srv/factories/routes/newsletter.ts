import { NewsletterRoute } from '@/routes/newsletter/index';
import { NewsletterRouteImplementation } from '@/routes/newsletter/implementation';
import { oNewsletterControllerFactory } from '../controllers/newsletter';

const makeNewsletterRoute = (): NewsletterRoute => {

    return new NewsletterRouteImplementation(oNewsletterControllerFactory);

};

export const oNewsletterRouteFactory = makeNewsletterRoute();
