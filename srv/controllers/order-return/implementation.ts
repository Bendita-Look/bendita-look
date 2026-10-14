import { OrderReturn, ReturnInput } from '@models/apps/dflc/benditalook/entities';
import { OrderReturnService } from '@/services/order-return';
import { BaseControllerResponse } from '@/controllers/base';
import { OrderReturnController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class OrderReturnControllerImplementation extends BaseControllerImplementation<OrderReturn> implements OrderReturnController {

    constructor(protected readonly Service: OrderReturnService) {

        super();

    }


    public async quoteReturn(OrderId: string, Input: ReturnInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.quoteReturn(OrderId, Input), 200);

    }


    public async registerReturn(OrderId: string, Input: ReturnInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.registerReturn(OrderId, Input), 201);

    }

}
