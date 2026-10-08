import { User } from '@sap/cds';
import { Category } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, ValidationError } from '@/errors';
import { CategoryRepository } from '@/repositories/category';
import { CategoryService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

export class CategoryServiceImplementation extends BaseServiceImplementation<Category> implements CategoryService {

    constructor(public readonly Repository: CategoryRepository) {

        super();

    }


    public async beforeCreate(Category: Category, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Category);

    }


    public async beforeUpdate(Category: Category, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Category);

    }


    public async beforeDelete(Category: Category, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.execute(async () => {

            const iProducts = await this.Repository.countProducts(Category.ID as string);

            if (iProducts > 0) {
                return left(new ConflictError('error.categoryInUse', { products: iProducts }));
            }

            return right(true);

        });

    }


    private async validate(Category: Category): Promise<Either<AbstractError, boolean>> {

        if ('Name' in Category && this.isBlank(Category.Name)) {
            return left(new ValidationError('error.categoryNameRequired'));
        }

        return right(true);

    }

}
