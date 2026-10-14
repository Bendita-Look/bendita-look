import { DeliveryInput, Order, OrderChangeInput, OrderInput, OrderItemInput, StoreSaleInput } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface OrderController extends BaseController<Order> {
    submitOrder(Input: OrderInput): Promise<BaseControllerResponse>;
    registerStoreSale(Input: StoreSaleInput): Promise<BaseControllerResponse>;
    quoteOrder(Items: OrderItemInput[], CouponCode?: string | null): Promise<BaseControllerResponse>;
    trackOrder(Number: number, AccessCode: string): Promise<BaseControllerResponse>;
    changeStatus(OrderId: string, Status: string, Delivery?: DeliveryInput | null): Promise<BaseControllerResponse>;
    quoteOrderUpdate(OrderId: string, Change: OrderChangeInput): Promise<BaseControllerResponse>;
    updateOrderItems(OrderId: string, Change: OrderChangeInput): Promise<BaseControllerResponse>;
}
