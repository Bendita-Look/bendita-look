import { Product } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface ProductController extends BaseController<Product> {
    afterEdit(ProductId: string): Promise<BaseControllerResponse>;
}
