import { StoreSettingsService } from '@/services/store-settings';
import { StoreSettingsServiceImplementation } from '@/services/store-settings/implementation';
import { oStoreSettingsRepositoryFactory } from '../repositories/store-settings';

const makeStoreSettingsService = (): StoreSettingsService => {

    return new StoreSettingsServiceImplementation(oStoreSettingsRepositoryFactory);

};

export const oStoreSettingsServiceFactory = makeStoreSettingsService();
