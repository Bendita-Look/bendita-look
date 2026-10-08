import { ApplicationService } from '@sap/cds';
import { Category } from '@models/apps/dflc/benditalook/entities';
import { CategoryController } from '@/controllers/category';
import { CategoryRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class CategoryRouteImplementation extends BaseRouteImplementation<Category> implements CategoryRoute {

    constructor(protected readonly Controller: CategoryController) {

        super();

    }


    public main(Service: ApplicationService): void {

        this.mainBase(Service, Service.entities.Categories);

    }

}
