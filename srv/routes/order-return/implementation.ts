import { ApplicationService, Request } from '@sap/cds';
import { OrderReturn } from '@models/apps/dflc/benditalook/entities';
import { OrderReturnController } from '@/controllers/order-return';
import { OrderReturnRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class OrderReturnRouteImplementation extends BaseRouteImplementation<OrderReturn> implements OrderReturnRoute {

    constructor(protected readonly Controller: OrderReturnController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('QuoteOrderReturn', this.quoteReturn.bind(this));

        Service.on('RegisterOrderReturn', this.registerReturn.bind(this));

    }


    private async quoteReturn(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.quoteReturn(Request.data.OrderId, Request.data.Return));

    }


    private async registerReturn(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.registerReturn(Request.data.OrderId, Request.data.Return));

    }

}
