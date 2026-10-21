import { Subscriber, Subscribers } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type SubscriberProperties = AuditProperties & {
    Id: string;
    Name?: string;
    Email: string;
    Active: boolean;
    Token: string;
    ConsentAt?: string;
    UnsubscribedAt?: string;
};

export class SubscriberModel extends BaseModel {

    constructor(private readonly properties: SubscriberProperties) { super(); }

    public static with(properties: SubscriberProperties): SubscriberModel {
        return new SubscriberModel(properties);
    }


    public static mapModel(Subscribers: Subscribers): SubscriberModel[] {

        return Subscribers.map((Subscriber: Subscriber) => SubscriberModel.with({
            Id: Subscriber.ID as string,
            Name: Subscriber.Name ?? undefined,
            Email: Subscriber.Email as string,
            Active: Subscriber.Active !== false,
            Token: Subscriber.Token as string,
            ConsentAt: Subscriber.ConsentAt ?? undefined,
            UnsubscribedAt: Subscriber.UnsubscribedAt ?? undefined,
            ...this.retrieveAudit(Subscriber)
        }));

    }


    public get Id() { return this.properties.Id; }

    public get Name() { return this.properties.Name; }

    public get Email() { return this.properties.Email; }

    public get Active() { return this.properties.Active; }

    public get Token() { return this.properties.Token; }

    public get ConsentAt() { return this.properties.ConsentAt; }


    public toEntityObject(): Subscriber {

        return this.cleanEntity({
            ID: this.properties.Id,
            Name: this.properties.Name ?? null,
            Email: this.properties.Email,
            Active: this.properties.Active,
            Token: this.properties.Token,
            ConsentAt: this.properties.ConsentAt ?? null,
            UnsubscribedAt: this.properties.UnsubscribedAt ?? null,
            ...this.auditEntityObject(this.properties)
        });

    }

}
