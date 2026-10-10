import { CatalogRoute } from '@/routes/catalog/index';
import { CatalogRouteImplementation } from '@/routes/catalog/implementation';
import { oOrderControllerFactory } from '../controllers/order';
import { oStoreSettingsRouteFactory } from './store-settings';

const makeCatalogRoute = (): CatalogRoute => {

    return new CatalogRouteImplementation(oOrderControllerFactory, oStoreSettingsRouteFactory);

};

export const oCatalogRouteFactory = makeCatalogRoute();
