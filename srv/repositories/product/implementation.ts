import cds from '@sap/cds';
import Decimal from 'decimal.js';
import { ProductModel } from '@/models/product';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { ProductRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductRepositoryImplementation extends BaseRepositoryImplementation<ProductModel> implements ProductRepository {

    public async updateCostPrice(Id: string, CostPrice: Decimal): Promise<void> {

        const nCostPrice = CostPrice.toNumber();

        await cds.run(UPDATE(this.getEntity()).set({ CostPrice: nCostPrice }).where({ ID: Id }));
        await cds.run(UPDATE(ServiceLocator.getDraftEntity(this.entityName())).set({ CostPrice: nCostPrice }).where({ ID: Id }));

    }


    protected entityName(): string {

        return 'Products';

    }


    protected mapResult(Rows: any[]): ProductModel[] {

        return ProductModel.mapModel(Rows);

    }

}
