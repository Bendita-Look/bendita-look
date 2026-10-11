import { ApplicationService } from '@sap/cds';
import { BaseRoute } from '../base';

export interface PromotionRoute extends BaseRoute {
    catalog(Service: ApplicationService): void;
}
