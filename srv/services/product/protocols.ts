import { Product } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface ProductService extends BaseService<Product> {
    afterEdit(ProductId: string): Promise<Either<AbstractError, boolean>>;
}
