import { CatalogRoute } from '@/routes/catalog/index';
import { CatalogRouteImplementation } from '@/routes/catalog/implementation';
import { oOrderControllerFactory } from '../controllers/order';

const makeCatalogRoute = (): CatalogRoute => {

    return new CatalogRouteImplementation(oOrderControllerFactory);

};

export const oCatalogRouteFactory = makeCatalogRoute();
