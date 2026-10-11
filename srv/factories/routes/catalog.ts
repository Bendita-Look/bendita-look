import { CatalogRoute } from '@/routes/catalog/index';
import { CatalogRouteImplementation } from '@/routes/catalog/implementation';
import { oOrderControllerFactory } from '../controllers/order';
import { oStoreSettingsRouteFactory } from './store-settings';
import { oPromotionRouteFactory } from './promotion';

const makeCatalogRoute = (): CatalogRoute => {

    return new CatalogRouteImplementation(oOrderControllerFactory, oStoreSettingsRouteFactory, oPromotionRouteFactory);

};

export const oCatalogRouteFactory = makeCatalogRoute();
