import { StoreSettingsRoute } from '@/routes/store-settings/index';
import { StoreSettingsRouteImplementation } from '@/routes/store-settings/implementation';
import { oStoreSettingsControllerFactory } from '../controllers/store-settings';

const makeStoreSettingsRoute = (): StoreSettingsRoute => {

    return new StoreSettingsRouteImplementation(oStoreSettingsControllerFactory);

};

export const oStoreSettingsRouteFactory = makeStoreSettingsRoute();
