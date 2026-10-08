import { ProductRoute } from '@/routes/product/index';
import { ProductRouteImplementation } from '@/routes/product/implementation';
import { oProductControllerFactory } from '../controllers/product';

const makeProductRoute = (): ProductRoute => {

    return new ProductRouteImplementation(oProductControllerFactory);

};

export const oProductRouteFactory = makeProductRoute();
