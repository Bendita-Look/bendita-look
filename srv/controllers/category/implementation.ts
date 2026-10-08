import { Category } from '@models/apps/dflc/benditalook/entities';
import { CategoryService } from '@/services/category';
import { CategoryController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class CategoryControllerImplementation extends BaseControllerImplementation<Category> implements CategoryController {

    constructor(protected readonly Service: CategoryService) {

        super();

    }

}
