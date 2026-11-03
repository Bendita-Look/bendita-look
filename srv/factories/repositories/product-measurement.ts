import { ProductMeasurementRepository } from '@/repositories/product-measurement';
import { ProductMeasurementRepositoryImplementation } from '@/repositories/product-measurement/implementation';

const makeProductMeasurementRepository = (): ProductMeasurementRepository => {

    return new ProductMeasurementRepositoryImplementation();

};

export const oProductMeasurementRepositoryFactory = makeProductMeasurementRepository();
