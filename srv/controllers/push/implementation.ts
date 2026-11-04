import { User } from '@sap/cds';
import { OrderPushSubscriptionInput, PushService, PushSubscriptionInput } from '@/services/push';
import { BaseControllerResponse } from '../base';
import { PushController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class PushControllerImplementation extends BaseControllerImplementation<unknown> implements PushController {

    constructor(protected readonly Service: PushService) {

        super();

    }


    public publicKey(): BaseControllerResponse {

        return { status: 200, data: this.Service.publicKey() };

    }


    public async subscribe(Input: PushSubscriptionInput, User?: User | null): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.subscribe(Input, User), 201);

    }


    public async unsubscribe(Endpoint: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.unsubscribe(Endpoint), 200);

    }


    public async sendTest(Locale: string | undefined): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.sendTest(Locale), 200);

    }


    public async subscribeOrders(Input: OrderPushSubscriptionInput, Locale: string | undefined): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.subscribeOrders(Input, Locale), 201);

    }


    public async unsubscribeOrders(Endpoint: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.unsubscribeOrders(Endpoint), 200);

    }

}
