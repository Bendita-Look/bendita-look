import { ProductController } from '@/controllers/product';
import { ProductControllerImplementation } from '@/controllers/product/implementation';
import { oProductServiceFactory } from '../services/product';

const makeProductController = (): ProductController => {

    return new ProductControllerImplementation(oProductServiceFactory);

};

export const oProductControllerFactory = makeProductController();
