import { ApplicationService } from '@sap/cds';
import { BaseRoute } from '../base';

export interface NewsletterRoute extends BaseRoute {
    catalog(Service: ApplicationService): void;
}
