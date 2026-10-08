import { ApplicationService } from '@sap/cds';

export interface BaseRoute {
    main(Service: ApplicationService): void;
}
