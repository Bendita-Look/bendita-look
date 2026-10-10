import { StoreSettingsController } from '@/controllers/store-settings';
import { StoreSettingsControllerImplementation } from '@/controllers/store-settings/implementation';
import { oStoreSettingsServiceFactory } from '../services/store-settings';

const makeStoreSettingsController = (): StoreSettingsController => {

    return new StoreSettingsControllerImplementation(oStoreSettingsServiceFactory);

};

export const oStoreSettingsControllerFactory = makeStoreSettingsController();
