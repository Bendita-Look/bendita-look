import { ActivePromotion, Promotion } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface PromotionService extends BaseService<Promotion> {
    activePromotions(): Promise<Either<AbstractError, ActivePromotion[]>>;
}
