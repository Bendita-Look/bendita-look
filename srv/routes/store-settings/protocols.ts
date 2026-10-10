import { BaseRoute } from '../base';
import { ApplicationService } from '@sap/cds';

export interface StoreSettingsRoute extends BaseRoute {
    catalog(Service: ApplicationService): void;
}
