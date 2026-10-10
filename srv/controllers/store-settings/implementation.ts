import { StoreSetting } from '@models/apps/dflc/benditalook/entities';
import { StoreSettingsService } from '@/services/store-settings';
import { BaseControllerResponse } from '@/controllers/base';
import { StoreSettingsController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class StoreSettingsControllerImplementation extends BaseControllerImplementation<StoreSetting> implements StoreSettingsController {

    constructor(protected readonly Service: StoreSettingsService) {

        super();

    }


    public async ensureSettings(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.ensureSettings(), 200);

    }


    public async storeInfo(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.storeInfo(), 200);

    }

}
