import { ApplicationService, Request } from '@sap/cds';
import { Order } from '@models/apps/dflc/benditalook/entities';
import { OrderController } from '@/controllers/order';
import { StoreSettingsRoute } from '@/routes/store-settings/index';
import { CatalogRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class CatalogRouteImplementation extends BaseRouteImplementation<Order> implements CatalogRoute {

    constructor(
        protected readonly Controller: OrderController,
        private readonly StoreSettingsRoute: StoreSettingsRoute
    ) {

        super();

    }


    public main(Service: ApplicationService): void {

        this.registerRequestContext(Service);

        Service.on('SubmitOrder', this.submitOrder.bind(this));

        Service.on('TrackOrder', this.trackOrder.bind(this));

        this.StoreSettingsRoute.catalog(Service);

    }


    private async submitOrder(Request: Request): Promise<unknown> {

        const oResult = await this.Controller.submitOrder(Request.data.Order);

        return this.resultOf(Request, oResult);

    }


    private async trackOrder(Request: Request): Promise<unknown> {

        const { Number, AccessCode } = Request.data;

        const oResult = await this.Controller.trackOrder(Number, AccessCode);

        return this.resultOf(Request, oResult);

    }

}
