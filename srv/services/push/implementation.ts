import webpush from 'web-push';
import cds, { User } from '@sap/cds';
import {
    ActionResult,
    OrderRef,
    PushSubscription
} from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, TooManyRequestsError, ValidationError } from '@/errors';
import { ORDER_LIMITS } from '@/constants/order-limits';
import { OrderStatus } from '@/constants/order-status';
import { Messages } from '@/infrastructure/Messages';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { StoreUrl } from '@/infrastructure/StoreUrl';
import { CustomerPushDeviceModel } from '@/models/customer-push-device';
import { OrderModel } from '@/models/order';
import { PushSubscriptionModel } from '@/models/push-subscription';
import { CustomerPushDeviceRepository } from '@/repositories/customer-push-device';
import { CustomerPushOrderRepository } from '@/repositories/customer-push-order';
import { OrderRepository } from '@/repositories/order';
import { PushSubscriptionRepository } from '@/repositories/push-subscription';
import { OrderRefs } from '@/services/order/order-refs';
import { StoreSettingsService } from '@/services/store-settings';
import { OrderPushSubscriptionInput, PushService, PushSubscriptionInput } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type WebPushSubscription = Parameters<typeof webpush.sendNotification>[0];

type PushTarget = {
    Endpoint: string;
    toWebPushSubscription(): WebPushSubscription;
};

const DEFAULT_VAPID_SUBJECT = 'mailto:contato@benditalook.com';
const ADMIN_ORDERS_PATH = 'admin/orders';
const TEST_PATH = 'admin';
const ORDER_PATH = 'order';
const SEND_OPTIONS: webpush.RequestOptions = { TTL: 3600, urgency: 'high', timeout: 5000 };
const UNUSABLE_SUBSCRIPTION_STATUSES = [404, 410];
const CUSTOMER_NOTIFIED_STATUSES = [OrderStatus.InService, OrderStatus.OutForDelivery, OrderStatus.Completed, OrderStatus.Cancelled];
const FINISHED_ORDER_STATUSES = [OrderStatus.Completed, OrderStatus.Cancelled];

export class PushServiceImplementation extends BaseServiceImplementation<PushSubscription> implements PushService {

    private vapidConfigured = false;

    constructor(
        private readonly Repository: PushSubscriptionRepository,
        private readonly DeviceRepository: CustomerPushDeviceRepository,
        private readonly OrderLinkRepository: CustomerPushOrderRepository,
        private readonly OrderRepository: OrderRepository,
        private readonly Settings: StoreSettingsService,
        private readonly OrderPushLimiter: RateLimiter
    ) {

        super();
        this.configure();

    }


    private configure(): void {

        const sPublicKey = process.env.VAPID_PUBLIC_KEY;
        const sPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!sPublicKey || !sPrivateKey) {
            return;
        }

        try {

            webpush.setVapidDetails(process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT, sPublicKey, sPrivateKey);
            this.vapidConfigured = true;

        } catch (oError) {

            cds.log('push').error('Chaves VAPID inválidas; Web Push desativado.', oError);

        }

    }


    public publicKey(): string | null {

        return this.vapidConfigured ? (process.env.VAPID_PUBLIC_KEY ?? null) : null;

    }


    public async subscribe(Input: PushSubscriptionInput, User?: User | null): Promise<Either<AbstractError, ActionResult>> {

        const sEndpoint = (Input?.Endpoint ?? '').trim();
        const sP256dh = (Input?.P256dh ?? '').trim();
        const sAuth = (Input?.Auth ?? '').trim();

        if (this.isBlank(sEndpoint) || this.isBlank(sP256dh) || this.isBlank(sAuth) || !this.isHttpsUrl(sEndpoint)) {
            return left(new ValidationError('error.invalidPushSubscription'));
        }

        if (!this.vapidConfigured) {
            return left(new ValidationError('error.pushNotConfigured'));
        }

        return this.execute<ActionResult>(async () => {

            const oExisting = await this.Repository.findByEndpoint(sEndpoint);

            const oModel = PushSubscriptionModel.with({
                Id: oExisting?.Id ?? this.generateUUID(),
                Endpoint: sEndpoint,
                P256dh: sP256dh,
                Auth: sAuth,
                UserAgent: (Input?.UserAgent ?? '').trim().slice(0, 255) || undefined,
                UserName: ((User?.id as string) ?? '').slice(0, 120) || undefined,
                Active: true
            });

            await this.Repository.upsertEntries([oModel.toEntityObject()]);

            return right({ success: true, data: Messages.text('push.subscribed', ServiceLocator.getLocale()) });

        });

    }


    public async unsubscribe(Endpoint: string): Promise<Either<AbstractError, ActionResult>> {

        if (this.isBlank(Endpoint)) {
            return left(new ValidationError('error.invalidPushSubscription'));
        }

        return this.execute<ActionResult>(async () => {

            await this.Repository.removeByEndpoint(Endpoint.trim());

            return right({ success: true, data: Messages.text('push.unsubscribed', ServiceLocator.getLocale()) });

        });

    }


    public async sendTest(Locale: string | undefined): Promise<Either<AbstractError, ActionResult>> {

        if (!this.vapidConfigured) {
            return left(new ValidationError('error.pushNotConfigured'));
        }

        return this.execute<ActionResult>(async () => {

            const aSubscriptions = await this.Repository.findActive();
            const sUrl = await this.buildUrl(TEST_PATH);
            const iSent = await this.sendToAll(aSubscriptions, {
                title: Messages.text('push.testTitle', Locale),
                body: Messages.text('push.testBody', Locale),
                tag: 'bendita-look-test',
                url: sUrl
            }, (sEndpoint) => this.Repository.deactivate(sEndpoint));

            return right({ success: true, data: Messages.text('push.testSent', Locale, { count: iSent }) });

        });

    }


    public async notifyNewOrder(Order: OrderModel, Locale: string | undefined): Promise<void> {

        if (!this.vapidConfigured) {
            return;
        }

        try {

            const aSubscriptions = await this.Repository.findActive();

            if (!aSubscriptions.length) {
                return;
            }

            const sUrl = await this.buildUrl(ADMIN_ORDERS_PATH);
            const sBody = Order.CustomerName
                ? Messages.text('push.newOrderBodyNamed', Locale, { name: Order.CustomerName })
                : Messages.text('push.newOrderBody', Locale);

            await this.sendToAll(aSubscriptions, {
                title: Messages.text('push.newOrderTitle', Locale, { number: Order.Number }),
                body: sBody,
                tag: `order-${Order.Id}`,
                url: sUrl
            }, (sEndpoint) => this.Repository.deactivate(sEndpoint));

        } catch (oError) {

            cds.log('push').error('Falha ao enviar notificações de novo pedido.', oError);

        }

    }


    public async subscribeOrders(Input: OrderPushSubscriptionInput, Locale: string | undefined): Promise<Either<AbstractError, ActionResult>> {

        const sEndpoint = (Input?.Endpoint ?? '').trim();
        const sP256dh = (Input?.P256dh ?? '').trim();
        const sAuth = (Input?.Auth ?? '').trim();

        if (this.isBlank(sEndpoint) || this.isBlank(sP256dh) || this.isBlank(sAuth) || !this.isHttpsUrl(sEndpoint)) {
            return left(new ValidationError('error.invalidPushSubscription'));
        }

        if (!this.vapidConfigured) {
            return left(new ValidationError('error.pushNotConfigured'));
        }

        const aOrders = Input?.Orders ?? [];

        if (aOrders.length > ORDER_LIMITS.maxOrdersPerLookup) {
            return left(new ValidationError('error.tooManyOrderRefs', { max: ORDER_LIMITS.maxOrdersPerLookup }));
        }

        if (!this.OrderPushLimiter.tryConsume(ServiceLocator.getClientIp())) {
            return left(new TooManyRequestsError('error.tooManyOrderPushRequests'));
        }

        return this.execute<ActionResult>(async () => {

            const aOrderIds = await this.findTrackableOrderIds(aOrders);
            const sDeviceId = await this.saveDevice(sEndpoint, sP256dh, sAuth, Locale);

            await this.OrderLinkRepository.replaceForDevice(sDeviceId, aOrderIds);

            return right({ success: true, data: Messages.text('push.orderSubscribed', Locale) });

        });

    }


    public async unsubscribeOrders(Endpoint: string): Promise<Either<AbstractError, ActionResult>> {

        if (this.isBlank(Endpoint)) {
            return left(new ValidationError('error.invalidPushSubscription'));
        }

        return this.execute<ActionResult>(async () => {

            await this.DeviceRepository.removeByEndpoint(Endpoint.trim());

            return right({ success: true, data: Messages.text('push.orderUnsubscribed', ServiceLocator.getLocale()) });

        });

    }


    public async notifyOrderStatus(Order: OrderModel): Promise<void> {

        if (!this.vapidConfigured || !CUSTOMER_NOTIFIED_STATUSES.includes(Order.Status)) {
            return;
        }

        try {

            await this.sendOrderStatus(Order);

            if (FINISHED_ORDER_STATUSES.includes(Order.Status)) {
                await this.OrderLinkRepository.removeByOrder(Order.Id);
                await this.DeviceRepository.removeOrphans();
            }

        } catch (oError) {

            cds.log('push').error('Falha ao enviar push de status do pedido.', oError);

        }

    }


    public async forgetOrder(OrderId: string): Promise<void> {

        await this.OrderLinkRepository.removeByOrder(OrderId);

    }


    private async findTrackableOrderIds(Orders: OrderRef[]): Promise<string[]> {

        const aRefs = OrderRefs.normalize(Orders);
        const aOrders = await this.OrderRepository.findIdentitiesByNumbers(aRefs.map((oRef) => oRef.Number));

        return aOrders
            .filter((oOrder) => OrderRefs.matches(aRefs, oOrder) && !FINISHED_ORDER_STATUSES.includes(oOrder.Status))
            .map((oOrder) => oOrder.ID);

    }


    private async saveDevice(Endpoint: string, P256dh: string, Auth: string, Locale: string | undefined): Promise<string> {

        const oExisting = await this.DeviceRepository.findByEndpoint(Endpoint);

        const oModel = CustomerPushDeviceModel.with({
            Id: oExisting?.Id ?? this.generateUUID(),
            Endpoint,
            P256dh,
            Auth,
            Locale: Locale?.slice(0, 10)
        });

        await this.DeviceRepository.upsertEntries([oModel.toEntityObject()]);

        return oModel.Id;

    }


    private async sendOrderStatus(Order: OrderModel): Promise<void> {

        const aDevices = await this.DeviceRepository.findByOrder(Order.Id);

        if (!aDevices.length) {
            return;
        }

        const sUrl = await this.buildUrl(`${ORDER_PATH}/${Order.Number}/${Order.AccessCode}`);

        for (const oDevice of aDevices) {

            await this.sendToAll([oDevice], this.orderStatusPayload(Order, oDevice.Locale, sUrl), (sEndpoint) => this.DeviceRepository.removeByEndpoint(sEndpoint));

        }

    }


    private orderStatusPayload(Order: OrderModel, Locale: string | undefined, Url: string): object {

        return {
            title: Messages.text('push.orderStatusTitle', Locale, { number: Order.Number }),
            body: Messages.text(`push.orderStatus.${Order.Status}`, Locale),
            tag: `order-status-${Order.Id}`,
            url: Url
        };

    }


    private async sendToAll(Subscriptions: PushTarget[], Payload: object | string, OnUnusable: (Endpoint: string) => Promise<void>): Promise<number> {

        const sBody = typeof Payload === 'string' ? Payload : JSON.stringify(Payload);
        let iSent = 0;

        await Promise.allSettled(Subscriptions.map(async (oSubscription) => {

            try {

                await webpush.sendNotification(oSubscription.toWebPushSubscription(), sBody, SEND_OPTIONS);
                iSent += 1;

            } catch (oError: unknown) {

                const iStatus = (oError as { statusCode?: number })?.statusCode;

                if (iStatus !== undefined && UNUSABLE_SUBSCRIPTION_STATUSES.includes(iStatus)) {

                    await OnUnusable(oSubscription.Endpoint);

                } else {

                    cds.log('push').warn(`Falha ao enviar push (${iStatus ?? 'sem status'}).`, oError);

                }

            }

        }));

        return iSent;

    }


    private async buildUrl(Path: string): Promise<string> {

        const sStoreUrl = await this.storeUrl();

        return `${sStoreUrl}#/${Path}`;

    }


    private async storeUrl(): Promise<string> {

        try {

            const oSettings = await this.Settings.currentSettings();

            return this.normalizeStoreUrl(oSettings.StoreUrl);

        } catch (oError) {

            cds.log('push').warn('Não foi possível obter a URL da loja para a notificação.', oError);

            return '/';

        }

    }


    private normalizeStoreUrl(Url: string | undefined): string {

        return StoreUrl.rootOf(Url) || '/';

    }


    private isHttpsUrl(Value: string): boolean {

        try {

            return new URL(Value).protocol === 'https:';

        } catch {

            return false;

        }

    }

}
