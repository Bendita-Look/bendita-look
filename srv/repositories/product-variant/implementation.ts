import cds from '@sap/cds';
import { ProductVariantModel } from '@/models/product-variant';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { ProductVariantRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class ProductVariantRepositoryImplementation extends BaseRepositoryImplementation<ProductVariantModel> implements ProductVariantRepository {

    public async findOrderableByIds(Ids: string[]): Promise<OrderableVariantModel[]> {

        if (!Ids.length) {
            return [];
        }

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .columns(
                    'ID',
                    'Size',
                    'Stock',
                    'Product_ID as ProductId',
                    'Color_ID as ColorId',
                    'Product.Category_ID as CategoryId',
                    'Product.Name as ProductName',
                    'Product.Price as Price',
                    'Product.CostPrice as CostPrice',
                    'Product.Active as ProductActive',
                    'Color.Name as ColorName'
                )
                .where({ ID: { in: Ids } })
        );

        return OrderableVariantModel.mapModel(oRows);

    }


    public async decreaseStock(Id: string, Quantity: number): Promise<boolean> {

        const iAffectedRows = await cds.run(
            UPDATE(this.getEntity())
                .set({ Stock: { '-=': Quantity } })
                .where({ ID: Id, Stock: { '>=': Quantity } })
        );

        return iAffectedRows > 0;

    }


    public async increaseStock(Id: string, Quantity: number): Promise<void> {

        await cds.run(
            UPDATE(this.getEntity())
                .set({ Stock: { '+=': Quantity } })
                .where({ ID: Id })
        );

    }


    public async sumStockByProducts(ProductIds: string[]): Promise<Map<string, number>> {

        if (!ProductIds.length) {
            return new Map();
        }

        const aRows = await cds.run(
            SELECT.from(this.getEntity())
                .columns('Product_ID as ProductId', 'sum(Stock) as Stock')
                .where({ Product_ID: { in: ProductIds } })
                .groupBy('Product_ID')
        );

        return new Map(aRows.map((oRow: { ProductId: string; Stock: number | null }) => [oRow.ProductId, Math.max(Number(oRow.Stock ?? 0), 0)]));

    }


    public async snapshotDraftStock(ProductId: string): Promise<void> {

        await cds.run(
            UPDATE(ServiceLocator.getDraftEntity(this.entityName()))
                .set({ StockOnEdit: { ref: ['Stock'] } })
                .where({ Product_ID: ProductId })
        );

    }


    protected entityName(): string {

        return 'ProductVariants';

    }


    protected mapResult(Rows: any[]): ProductVariantModel[] {

        return ProductVariantModel.mapModel(Rows);

    }

}
