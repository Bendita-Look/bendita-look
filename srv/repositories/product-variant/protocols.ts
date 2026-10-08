import { ProductVariantModel } from '@/models/product-variant';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { BaseRepository } from '../base';

export interface ProductVariantRepository extends BaseRepository<ProductVariantModel> {
    findOrderableByIds(Ids: string[]): Promise<OrderableVariantModel[]>;
    decreaseStock(Id: string, Quantity: number): Promise<boolean>;
    increaseStock(Id: string, Quantity: number): Promise<void>;
    snapshotDraftStock(ProductId: string): Promise<void>;
}
