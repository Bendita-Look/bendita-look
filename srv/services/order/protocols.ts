import {
    DeliveryInput,
    Order,
    OrderChangeInput,
    OrderInput,
    OrderItemInput,
    OrderQuote,
    StoreSaleInput,
    SubmitOrderResult,
    TrackedOrder
} from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface OrderService extends BaseService<Order> {
    submitOrder(Input: OrderInput): Promise<Either<AbstractError, SubmitOrderResult>>;
    registerStoreSale(Input: StoreSaleInput): Promise<Either<AbstractError, SubmitOrderResult>>;
    quoteOrder(Items: OrderItemInput[], CouponCode?: string | null): Promise<Either<AbstractError, OrderQuote>>;
    trackOrder(Number: number, AccessCode: string): Promise<Either<AbstractError, TrackedOrder>>;
    changeStatus(OrderId: string, Status: string, Delivery?: DeliveryInput | null): Promise<Either<AbstractError, boolean>>;
    quoteOrderUpdate(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>>;
    updateOrderItems(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>>;
}
