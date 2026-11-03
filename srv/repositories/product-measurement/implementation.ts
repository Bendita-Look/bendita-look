import { ProductMeasurementModel } from '@/models/product-measurement';
import { ProductMeasurementRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductMeasurementRepositoryImplementation extends BaseRepositoryImplementation<ProductMeasurementModel> implements ProductMeasurementRepository {

    protected entityName(): string {

        return 'ProductMeasurements';

    }


    protected mapResult(Rows: any[]): ProductMeasurementModel[] {

        return ProductMeasurementModel.mapModel(Rows);

    }

}
