import { CatalogRoute } from '@/routes/catalog/index';
import { CatalogRouteImplementation } from '@/routes/catalog/implementation';
import { oOrderControllerFactory } from '../controllers/order';
import { oStoreSettingsRouteFactory } from './store-settings';
import { oPromotionRouteFactory } from './promotion';
import { oNewsletterRouteFactory } from './newsletter';
import { oPushRouteFactory } from './push';

const makeCatalogRoute = (): CatalogRoute => {

    return new CatalogRouteImplementation(oOrderControllerFactory, oStoreSettingsRouteFactory, oPromotionRouteFactory, oNewsletterRouteFactory, oPushRouteFactory);

};

export const oCatalogRouteFactory = makeCatalogRoute();
