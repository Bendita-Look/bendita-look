import { StoreSetting } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface StoreSettingsController extends BaseController<StoreSetting> {
    ensureSettings(): Promise<BaseControllerResponse>;
    storeInfo(): Promise<BaseControllerResponse>;
}
