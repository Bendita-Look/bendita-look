import { ApplicationService, Request } from '@sap/cds';
import { Order } from '@models/apps/dflc/benditalook/entities';
import { OrderController } from '@/controllers/order';
import { OrderRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class OrderRouteImplementation extends BaseRouteImplementation<Order> implements OrderRoute {

    constructor(protected readonly Controller: OrderController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('ChangeOrderStatus', this.changeOrderStatus.bind(this));

        Service.on('RegisterStoreSale', this.registerStoreSale.bind(this));

        Service.on('QuoteOrderUpdate', this.quoteOrderUpdate.bind(this));

        Service.on('UpdateOrderItems', this.updateOrderItems.bind(this));

    }


    private async quoteOrderUpdate(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.quoteOrderUpdate(Request.data.OrderId, Request.data.Items));

    }


    private async updateOrderItems(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.updateOrderItems(Request.data.OrderId, Request.data.Items));

    }


    private async registerStoreSale(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.registerStoreSale(Request.data.Sale));

    }


    private async changeOrderStatus(Request: Request): Promise<unknown> {

        const { OrderId, Status, Delivery } = Request.data;

        const oResult = await this.Controller.changeStatus(OrderId, Status, Delivery);

        this.rejectOnError(Request, oResult);

        return { success: true, data: Status };

    }

}
