import webpush from 'web-push';
import cds, { User } from '@sap/cds';
import {
    ActionResult,
    PushSubscription
} from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { Messages } from '@/infrastructure/Messages';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { StoreUrl } from '@/infrastructure/StoreUrl';
import { OrderModel } from '@/models/order';
import { PushSubscriptionModel } from '@/models/push-subscription';
import { PushSubscriptionRepository } from '@/repositories/push-subscription';
import { StoreSettingsService } from '@/services/store-settings';
import { PushService, PushSubscriptionInput } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const DEFAULT_VAPID_SUBJECT = 'mailto:contato@benditalook.com';
const ADMIN_ORDERS_PATH = 'admin/orders';
const TEST_PATH = 'admin';
const SEND_OPTIONS: webpush.RequestOptions = { TTL: 3600, urgency: 'high', timeout: 5000 };
const UNUSABLE_SUBSCRIPTION_STATUSES = [404, 410];

export class PushServiceImplementation extends BaseServiceImplementation<PushSubscription> implements PushService {

    private vapidConfigured = false;

    constructor(
        private readonly Repository: PushSubscriptionRepository,
        private readonly Settings: StoreSettingsService
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
            });

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
            });

        } catch (oError) {

            cds.log('push').error('Falha ao enviar notificações de novo pedido.', oError);

        }

    }


    private async sendToAll(Subscriptions: PushSubscriptionModel[], Payload: object | string): Promise<number> {

        const sBody = typeof Payload === 'string' ? Payload : JSON.stringify(Payload);
        let iSent = 0;

        await Promise.allSettled(Subscriptions.map(async (oSubscription) => {

            try {

                await webpush.sendNotification(oSubscription.toWebPushSubscription(), sBody, SEND_OPTIONS);
                iSent += 1;

            } catch (oError: unknown) {

                const iStatus = (oError as { statusCode?: number })?.statusCode;

                if (iStatus !== undefined && UNUSABLE_SUBSCRIPTION_STATUSES.includes(iStatus)) {

                    await this.Repository.deactivate(oSubscription.Endpoint);

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
