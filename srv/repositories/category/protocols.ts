import { CategoryModel } from '@/models/category';
import { BaseRepository } from '../base';

export interface CategoryRepository extends BaseRepository<CategoryModel> {
    countProducts(CategoryId: string): Promise<number>;
    findImageContentById(Id: string): Promise<CategoryModel | null>;
}
