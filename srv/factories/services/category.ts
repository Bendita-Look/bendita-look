import { CategoryService } from '@/services/category';
import { CategoryServiceImplementation } from '@/services/category/implementation';
import { oCategoryRepositoryFactory } from '../repositories/category';

const makeCategoryService = (): CategoryService => {

    return new CategoryServiceImplementation(oCategoryRepositoryFactory);

};

export const oCategoryServiceFactory = makeCategoryService();
