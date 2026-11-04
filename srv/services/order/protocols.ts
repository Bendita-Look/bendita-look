import {
    ActionResult,
    DeliveryInput,
    Order,
    OrderChangeInput,
    OrderInput,
    OrderItemInput,
    OrderQuote,
    OrderRef,
    OrderSummary,
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
    lookupOrders(Orders: OrderRef[] | null | undefined): Promise<Either<AbstractError, OrderSummary[]>>;
    requestOrderLinks(Email: string | null | undefined, Locale: string | undefined): Promise<Either<AbstractError, ActionResult>>;
    changeStatus(OrderId: string, Status: string, Delivery?: DeliveryInput | null): Promise<Either<AbstractError, boolean>>;
    deleteOrders(OrderIds: string[], RestoreStock: boolean): Promise<Either<AbstractError, boolean>>;
    trackingUrl(OrderId: string): Promise<Either<AbstractError, string | null>>;
    quoteOrderUpdate(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>>;
    updateOrderItems(OrderId: string, Change: OrderChangeInput): Promise<Either<AbstractError, OrderQuote>>;
}
