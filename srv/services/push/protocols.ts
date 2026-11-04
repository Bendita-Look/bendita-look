import {
    ActionResult,
    OrderRef,
    PushSubscription
} from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { User } from '@sap/cds';
import { AbstractError } from '@/errors';
import { OrderModel } from '@/models/order';
import { BaseService } from '../base';

export type PushSubscriptionInput = {
    Endpoint: string;
    P256dh: string;
    Auth: string;
    UserAgent?: string;
};

export type OrderPushSubscriptionInput = {
    Endpoint: string;
    P256dh: string;
    Auth: string;
    Orders?: OrderRef[] | null;
};

export interface PushService extends BaseService<PushSubscription> {
    /** Chave pública VAPID (a mesma que o navegador usa para se inscrever); null se não configurada. */
    publicKey(): string | null;
    subscribe(Input: PushSubscriptionInput, User?: User | null): Promise<Either<AbstractError, ActionResult>>;
    unsubscribe(Endpoint: string): Promise<Either<AbstractError, ActionResult>>;
    sendTest(Locale: string | undefined): Promise<Either<AbstractError, ActionResult>>;
    /** Avisa todos os dispositivos inscritos sobre um novo pedido (não interrompe o fluxo do pedido). */
    notifyNewOrder(Order: OrderModel, Locale: string | undefined): Promise<void>;
    /** Inscreve um aparelho de cliente nos avisos de status dos pedidos informados (Number + AccessCode). */
    subscribeOrders(Input: OrderPushSubscriptionInput, Locale: string | undefined): Promise<Either<AbstractError, ActionResult>>;
    unsubscribeOrders(Endpoint: string): Promise<Either<AbstractError, ActionResult>>;
    /** Avisa a cliente sobre a mudança de status do pedido (não interrompe a mudança de status). */
    notifyOrderStatus(Order: OrderModel): Promise<void>;
    /** Desvincula os aparelhos do pedido antes de ele ser excluído. */
    forgetOrder(OrderId: string): Promise<void>;
}
