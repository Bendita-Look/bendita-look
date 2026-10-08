import { CategoryController } from '@/controllers/category';
import { CategoryControllerImplementation } from '@/controllers/category/implementation';
import { oCategoryServiceFactory } from '../services/category';

const makeCategoryController = (): CategoryController => {

    return new CategoryControllerImplementation(oCategoryServiceFactory);

};

export const oCategoryControllerFactory = makeCategoryController();
