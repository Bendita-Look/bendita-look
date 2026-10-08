import { ProductRepository } from '@/repositories/product';
import { ProductRepositoryImplementation } from '@/repositories/product/implementation';

const makeProductRepository = (): ProductRepository => {

    return new ProductRepositoryImplementation();

};

export const oProductRepositoryFactory = makeProductRepository();
