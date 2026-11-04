import { ApplicationService, Request } from '@sap/cds';
import { PushController } from '@/controllers/push';
import { PushRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class PushRouteImplementation extends BaseRouteImplementation<unknown> implements PushRoute {

    constructor(protected readonly Controller: PushController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('PushPublicKey', this.publicKey.bind(this));
        Service.on('SubscribePush', this.subscribe.bind(this));
        Service.on('UnsubscribePush', this.unsubscribe.bind(this));
        Service.on('SendPushTest', this.sendTest.bind(this));

    }


    public catalog(Service: ApplicationService): void {

        Service.on('PushPublicKey', this.publicKey.bind(this));
        Service.on('SubscribeOrdersPush', this.subscribeOrders.bind(this));
        Service.on('UnsubscribeOrdersPush', this.unsubscribeOrders.bind(this));

    }


    private publicKey(Request: Request): unknown {

        return this.resultOf(Request, this.Controller.publicKey());

    }


    private async subscribe(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.subscribe({
            Endpoint: Request.data.Endpoint,
            P256dh: Request.data.P256dh,
            Auth: Request.data.Auth,
            UserAgent: Request.data.UserAgent
        }, Request.user));

    }


    private async unsubscribe(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.unsubscribe(Request.data.Endpoint));

    }


    private async sendTest(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.sendTest(Request.locale));

    }


    private async subscribeOrders(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.subscribeOrders({
            Endpoint: Request.data.Endpoint,
            P256dh: Request.data.P256dh,
            Auth: Request.data.Auth,
            Orders: Request.data.Orders
        }, Request.locale));

    }


    private async unsubscribeOrders(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.unsubscribeOrders(Request.data.Endpoint));

    }

}
