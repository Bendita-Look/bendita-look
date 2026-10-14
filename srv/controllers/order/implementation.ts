import { DeliveryInput, Order, OrderChangeInput, OrderInput, OrderItemInput, StoreSaleInput } from '@models/apps/dflc/benditalook/entities';
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


    public async registerStoreSale(Input: StoreSaleInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.registerStoreSale(Input), 201);

    }


    public async quoteOrder(Items: OrderItemInput[], CouponCode?: string | null): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.quoteOrder(Items, CouponCode), 200);

    }


    public async trackOrder(Number: number, AccessCode: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.trackOrder(Number, AccessCode), 200);

    }


    public async changeStatus(OrderId: string, Status: string, Delivery?: DeliveryInput | null): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.changeStatus(OrderId, Status, Delivery), 200);

    }


    public async quoteOrderUpdate(OrderId: string, Change: OrderChangeInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.quoteOrderUpdate(OrderId, Change), 200);

    }


    public async updateOrderItems(OrderId: string, Change: OrderChangeInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.updateOrderItems(OrderId, Change), 200);

    }

}
