import { OrderReturn, ReturnInput, ReturnQuote } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface OrderReturnService extends BaseService<OrderReturn> {
    quoteReturn(OrderId: string, Input: ReturnInput): Promise<Either<AbstractError, ReturnQuote>>;
    registerReturn(OrderId: string, Input: ReturnInput): Promise<Either<AbstractError, ReturnQuote>>;
}
