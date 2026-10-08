import { ApplicationService, Request } from '@sap/cds';
import { Product } from '@models/apps/dflc/benditalook/entities';
import { ProductController } from '@/controllers/product';
import { ProductRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class ProductRouteImplementation extends BaseRouteImplementation<Product> implements ProductRoute {

    constructor(protected readonly Controller: ProductController) {

        super();

    }


    public main(Service: ApplicationService): void {

        const { Products } = Service.entities;

        this.mainBase(Service, Products);

        Service.after('EDIT', Products, this.afterEdit.bind(this));

    }


    private async afterEdit(Draft: unknown, Request: Request): Promise<void> {

        const oResult = await this.Controller.afterEdit((Draft as Product).ID as string);

        this.rejectOnError(Request, oResult);

    }

}
