import { ProductModel } from '@/models/product';
import { ProductRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductRepositoryImplementation extends BaseRepositoryImplementation<ProductModel> implements ProductRepository {

    protected entityName(): string {

        return 'Products';

    }


    protected mapResult(Rows: any[]): ProductModel[] {

        return ProductModel.mapModel(Rows);

    }

}
