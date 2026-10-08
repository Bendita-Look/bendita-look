import { Order, OrderInput, SubmitOrderResult, TrackedOrder } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface OrderService extends BaseService<Order> {
    submitOrder(Input: OrderInput): Promise<Either<AbstractError, SubmitOrderResult>>;
    trackOrder(Number: number, AccessCode: string): Promise<Either<AbstractError, TrackedOrder>>;
    changeStatus(OrderId: string, Status: string): Promise<Either<AbstractError, boolean>>;
}
