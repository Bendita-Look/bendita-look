import { Order, OrderInput } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface OrderController extends BaseController<Order> {
    submitOrder(Input: OrderInput): Promise<BaseControllerResponse>;
    trackOrder(Number: number, AccessCode: string): Promise<BaseControllerResponse>;
    changeStatus(OrderId: string, Status: string): Promise<BaseControllerResponse>;
}
