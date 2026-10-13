import cds from '@sap/cds';
import { ProductImageModel } from '@/models/product-image';
import { ProductImageRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductImageRepositoryImplementation extends BaseRepositoryImplementation<ProductImageModel> implements ProductImageRepository {

    public async findContentById(Id: string): Promise<ProductImageModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .columns('ID', 'Product_ID', 'ImageType', 'Image')
                .where({ ID: Id })
        );

        return this.mapResult(oRows)[0] ?? null;

    }


    public async findByProductIds(ProductIds: string[]): Promise<ProductImageModel[]> {

        if (!ProductIds.length) {
            return [];
        }

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .columns('ID', 'Product_ID', 'Color_ID', 'SortOrder', 'ImageType')
                .where({ Product_ID: { in: ProductIds } })
                .orderBy('SortOrder')
        );

        return this.mapResult(oRows);

    }


    protected entityName(): string {

        return 'ProductImages';

    }


    protected mapResult(Rows: any[]): ProductImageModel[] {

        return ProductImageModel.mapModel(Rows);

    }

}
