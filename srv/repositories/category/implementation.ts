import cds from '@sap/cds';
import { CategoryModel } from '@/models/category';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { CategoryRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class CategoryRepositoryImplementation extends BaseRepositoryImplementation<CategoryModel> implements CategoryRepository {

    public async countProducts(CategoryId: string): Promise<number> {

        const oResult = await cds.run(
            SELECT.one.from(ServiceLocator.getEntity('Products'))
                .columns('count(1) as total')
                .where({ Category_ID: CategoryId })
        );

        return Number(oResult?.total ?? 0);

    }


    protected entityName(): string {

        return 'Categories';

    }


    protected mapResult(Rows: any[]): CategoryModel[] {

        return CategoryModel.mapModel(Rows);

    }

}
