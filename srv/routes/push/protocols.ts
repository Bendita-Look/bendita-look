import { ApplicationService } from '@sap/cds';
import { BaseRoute } from '../base';

export interface PushRoute extends BaseRoute {
    catalog(Service: ApplicationService): void;
}
