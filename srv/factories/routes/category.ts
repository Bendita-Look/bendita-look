import { CategoryRoute } from '@/routes/category/index';
import { CategoryRouteImplementation } from '@/routes/category/implementation';
import { oCategoryControllerFactory } from '../controllers/category';

const makeCategoryRoute = (): CategoryRoute => {

    return new CategoryRouteImplementation(oCategoryControllerFactory);

};

export const oCategoryRouteFactory = makeCategoryRoute();
