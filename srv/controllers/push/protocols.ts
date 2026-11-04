import { User } from '@sap/cds';
import { OrderPushSubscriptionInput, PushService, PushSubscriptionInput } from '@/services/push';
import { BaseController, BaseControllerResponse } from '../base';
import { BaseControllerImplementation } from '../base/implementation';

export interface PushController extends BaseController<unknown> {
    publicKey(): BaseControllerResponse;
    subscribe(Input: PushSubscriptionInput, User?: User | null): Promise<BaseControllerResponse>;
    unsubscribe(Endpoint: string): Promise<BaseControllerResponse>;
    sendTest(Locale: string | undefined): Promise<BaseControllerResponse>;
    subscribeOrders(Input: OrderPushSubscriptionInput, Locale: string | undefined): Promise<BaseControllerResponse>;
    unsubscribeOrders(Endpoint: string): Promise<BaseControllerResponse>;
}
