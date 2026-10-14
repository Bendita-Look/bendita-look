import { OrderReturn, ReturnInput } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface OrderReturnController extends BaseController<OrderReturn> {
    quoteReturn(OrderId: string, Input: ReturnInput): Promise<BaseControllerResponse>;
    registerReturn(OrderId: string, Input: ReturnInput): Promise<BaseControllerResponse>;
}
