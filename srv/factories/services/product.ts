import { ProductService } from '@/services/product';
import { ProductServiceImplementation } from '@/services/product/implementation';
import { oProductRepositoryFactory } from '../repositories/product';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';

const makeProductService = (): ProductService => {

    return new ProductServiceImplementation(oProductRepositoryFactory, oProductVariantRepositoryFactory);

};

export const oProductServiceFactory = makeProductService();
