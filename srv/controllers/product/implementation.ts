import { Product } from '@models/apps/dflc/benditalook/entities';
import { ProductService } from '@/services/product';
import { BaseControllerResponse } from '@/controllers/base';
import { ProductController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class ProductControllerImplementation extends BaseControllerImplementation<Product> implements ProductController {

    constructor(protected readonly Service: ProductService) {

        super();

    }


    public async afterEdit(ProductId: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.afterEdit(ProductId), 200);

    }

}
