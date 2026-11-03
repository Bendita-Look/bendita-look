import { StorePolicies, StorePolicy } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type StorePolicyProperties = AuditProperties & {
    Id: string;
    Type: string;
    Title: string;
    Slug?: string;
    Content?: string;
    Active: boolean;
    SortOrder: number;
};

export class StorePolicyModel extends BaseModel {

    constructor(private readonly properties: StorePolicyProperties) { super(); }

    public static with(properties: StorePolicyProperties): StorePolicyModel {
        return new StorePolicyModel(properties);
    }

    public static mapModel(Policies: StorePolicies): StorePolicyModel[] {

        return Policies.map((Policy: StorePolicy) => StorePolicyModel.with({
            Id: Policy.ID as string,
            Type: Policy.Type as string,
            Title: Policy.Title as string,
            Slug: Policy.Slug ?? undefined,
            Content: Policy.Content ?? undefined,
            Active: Policy.Active !== false,
            SortOrder: Policy.SortOrder ?? 0,
            ...this.retrieveAudit(Policy)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Type() { return this.properties.Type; }

    public get Title() { return this.properties.Title; }

    public get Active() { return this.properties.Active; }

    public toEntityObject(): StorePolicy {

        return this.cleanEntity({
            ID: this.properties.Id,
            Type: this.properties.Type,
            Title: this.properties.Title,
            Slug: this.properties.Slug ?? null,
            Content: this.properties.Content ?? null,
            Active: this.properties.Active,
            SortOrder: this.properties.SortOrder,
            ...this.auditEntityObject(this.properties)
        });

    }

}
