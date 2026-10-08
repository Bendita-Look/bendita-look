import { Order, OrderInput } from '@models/apps/dflc/benditalook/entities';
import { OrderService } from '@/services/order';
import { BaseControllerResponse } from '@/controllers/base';
import { OrderController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class OrderControllerImplementation extends BaseControllerImplementation<Order> implements OrderController {

    constructor(protected readonly Service: OrderService) {

        super();

    }


    public async submitOrder(Input: OrderInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.submitOrder(Input), 201);

    }


    public async trackOrder(Number: number, AccessCode: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.trackOrder(Number, AccessCode), 200);

    }


    public async changeStatus(OrderId: string, Status: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.changeStatus(OrderId, Status), 200);

    }

}
