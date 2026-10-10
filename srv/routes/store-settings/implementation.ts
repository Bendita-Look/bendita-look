import { ApplicationService, Request } from '@sap/cds';
import { StoreSetting } from '@models/apps/dflc/benditalook/entities';
import { StoreSettingsController } from '@/controllers/store-settings';
import { StoreSettingsRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class StoreSettingsRouteImplementation extends BaseRouteImplementation<StoreSetting> implements StoreSettingsRoute {

    constructor(protected readonly Controller: StoreSettingsController) {

        super();

    }


    public main(Service: ApplicationService): void {

        const { StoreSettings } = Service.entities;

        this.mainBase(Service, StoreSettings);

        Service.before('READ', StoreSettings, this.ensureSettings.bind(this));

    }


    public catalog(Service: ApplicationService): void {

        Service.on('StoreInfo', this.storeInfo.bind(this));

    }


    private async ensureSettings(Request: Request): Promise<void> {

        this.rejectOnError(Request, await this.Controller.ensureSettings());

    }


    private async storeInfo(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.storeInfo());

    }

}
