import {
    ActionResult,
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

export interface PushService extends BaseService<PushSubscription> {
    /** Chave pública VAPID (a mesma que o navegador usa para se inscrever); null se não configurada. */
    publicKey(): string | null;
    subscribe(Input: PushSubscriptionInput, User?: User | null): Promise<Either<AbstractError, ActionResult>>;
    unsubscribe(Endpoint: string): Promise<Either<AbstractError, ActionResult>>;
    sendTest(Locale: string | undefined): Promise<Either<AbstractError, ActionResult>>;
    /** Avisa todos os dispositivos inscritos sobre um novo pedido (não interrompe o fluxo do pedido). */
    notifyNewOrder(Order: OrderModel, Locale: string | undefined): Promise<void>;
}
