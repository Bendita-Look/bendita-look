import { NewsletterCampaign, NewsletterCampaigns } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type NewsletterCampaignProperties = AuditProperties & {
    Id: string;
    Subject: string;
    Body?: string;
    Status: string;
    SentAt?: string;
    RecipientCount: number;
    FailureCount: number;
};

export class NewsletterCampaignModel extends BaseModel {

    constructor(private readonly properties: NewsletterCampaignProperties) { super(); }

    public static with(properties: NewsletterCampaignProperties): NewsletterCampaignModel {
        return new NewsletterCampaignModel(properties);
    }


    public static mapModel(Campaigns: NewsletterCampaigns): NewsletterCampaignModel[] {

        return Campaigns.map((Campaign: NewsletterCampaign) => NewsletterCampaignModel.with({
            Id: Campaign.ID as string,
            Subject: Campaign.Subject as string,
            Body: Campaign.Body ?? undefined,
            Status: Campaign.Status ?? 'DRAFT',
            SentAt: Campaign.SentAt ?? undefined,
            RecipientCount: Campaign.RecipientCount ?? 0,
            FailureCount: Campaign.FailureCount ?? 0,
            ...this.retrieveAudit(Campaign)
        }));

    }


    public get Id() { return this.properties.Id; }

    public get Subject() { return this.properties.Subject; }

    public get Body() { return this.properties.Body; }

    public get Status() { return this.properties.Status; }

    public get SentAt() { return this.properties.SentAt; }

    public get RecipientCount() { return this.properties.RecipientCount; }

    public get FailureCount() { return this.properties.FailureCount; }


    public toEntityObject(): NewsletterCampaign {

        return this.cleanEntity({
            ID: this.properties.Id,
            Subject: this.properties.Subject,
            Body: this.properties.Body ?? null,
            Status: this.properties.Status,
            SentAt: this.properties.SentAt ?? null,
            RecipientCount: this.properties.RecipientCount,
            FailureCount: this.properties.FailureCount,
            ...this.auditEntityObject(this.properties)
        });

    }

}
