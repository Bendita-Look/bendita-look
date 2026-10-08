import { ProductVariantRepository } from '@/repositories/product-variant';
import { ProductVariantRepositoryImplementation } from '@/repositories/product-variant/implementation';

const makeProductVariantRepository = (): ProductVariantRepository => {

    return new ProductVariantRepositoryImplementation();

};

export const oProductVariantRepositoryFactory = makeProductVariantRepository();
