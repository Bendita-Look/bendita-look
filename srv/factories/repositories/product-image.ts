import { ProductImageRepository } from '@/repositories/product-image';
import { ProductImageRepositoryImplementation } from '@/repositories/product-image/implementation';

const makeProductImageRepository = (): ProductImageRepository => {

    return new ProductImageRepositoryImplementation();

};

export const oProductImageRepositoryFactory = makeProductImageRepository();
