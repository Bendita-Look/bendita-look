import Decimal from 'decimal.js';
import { ProductModel } from '@/models/product';
import { BaseRepository } from '../base';

export interface ProductRepository extends BaseRepository<ProductModel> {
    updateCostPrice(Id: string, CostPrice: Decimal): Promise<void>;
}
