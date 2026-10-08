import { ProductColorModel } from '@/models/product-color';
import { ProductColorRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductColorRepositoryImplementation extends BaseRepositoryImplementation<ProductColorModel> implements ProductColorRepository {

    protected entityName(): string {

        return 'ProductColors';

    }


    protected mapResult(Rows: any[]): ProductColorModel[] {

        return ProductColorModel.mapModel(Rows);

    }

}
