import { StoreSettingsRepository } from '@/repositories/store-settings';
import { StoreSettingsRepositoryImplementation } from '@/repositories/store-settings/implementation';

const makeStoreSettingsRepository = (): StoreSettingsRepository => {

    return new StoreSettingsRepositoryImplementation();

};

export const oStoreSettingsRepositoryFactory = makeStoreSettingsRepository();
