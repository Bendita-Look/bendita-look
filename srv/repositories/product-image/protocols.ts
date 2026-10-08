import { ProductImageModel } from '@/models/product-image';
import { BaseRepository } from '../base';

export interface ProductImageRepository extends BaseRepository<ProductImageModel> {
    findContentById(Id: string): Promise<ProductImageModel | null>;
}
