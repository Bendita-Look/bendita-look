import { ProductColorRepository } from '@/repositories/product-color';
import { ProductColorRepositoryImplementation } from '@/repositories/product-color/implementation';

const makeProductColorRepository = (): ProductColorRepository => {

    return new ProductColorRepositoryImplementation();

};

export const oProductColorRepositoryFactory = makeProductColorRepository();
