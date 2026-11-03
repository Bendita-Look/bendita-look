import { PushSubscription, PushSubscriptions } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type PushSubscriptionProperties = AuditProperties & {
    Id: string;
    Endpoint: string;
    P256dh: string;
    Auth: string;
    UserAgent?: string;
    UserName?: string;
    Active: boolean;
};

export class PushSubscriptionModel extends BaseModel {

    constructor(private readonly properties: PushSubscriptionProperties) { super(); }


    public static with(properties: PushSubscriptionProperties): PushSubscriptionModel {
        return new PushSubscriptionModel(properties);
    }


    public static mapModel(Subscriptions: PushSubscriptions): PushSubscriptionModel[] {

        return Subscriptions.map((Subscription: PushSubscription) => PushSubscriptionModel.with({
            Id: Subscription.ID as string,
            Endpoint: Subscription.Endpoint as string,
            P256dh: Subscription.P256dh as string,
            Auth: Subscription.Auth as string,
            UserAgent: Subscription.UserAgent ?? undefined,
            UserName: Subscription.UserName ?? undefined,
            Active: Subscription.Active !== false,
            ...this.retrieveAudit(Subscription)
        }));

    }


    public get Id() { return this.properties.Id; }

    public get Endpoint() { return this.properties.Endpoint; }

    public get P256dh() { return this.properties.P256dh; }

    public get Auth() { return this.properties.Auth; }

    public get Active() { return this.properties.Active; }


    /** Formato aceito pelo web-push. */
    public toWebPushSubscription(): { endpoint: string; keys: { p256dh: string; auth: string } } {

        return {
            endpoint: this.properties.Endpoint,
            keys: {
                p256dh: this.properties.P256dh,
                auth: this.properties.Auth
            }
        };

    }


    public toEntityObject(): PushSubscription {

        return this.cleanEntity({
            ID: this.properties.Id,
            Endpoint: this.properties.Endpoint,
            P256dh: this.properties.P256dh,
            Auth: this.properties.Auth,
            UserAgent: this.properties.UserAgent ?? null,
            UserName: this.properties.UserName ?? null,
            Active: this.properties.Active,
            ...this.auditEntityObject(this.properties)
        }) as PushSubscription;

    }

}
