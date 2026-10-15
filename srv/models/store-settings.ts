import { StoreSetting, StoreSettings } from '@models/apps/dflc/benditalook/entities';
import { Readable } from 'stream';
import { AuditProperties, BaseModel } from './base';

export type StoreSettingsProperties = AuditProperties & {
    Id: string;
    StoreName: string;
    Whatsapp?: string;
    ContactEmail?: string;
    Instagram?: string;
    NotificationEmails?: string;
    PickupAddress?: string;
    WhatsappSignature?: string;
    StoreUrl?: string;
    BannerImageType?: string;
    BannerImage?: Readable;
};

export class StoreSettingsModel extends BaseModel {

    constructor(private readonly properties: StoreSettingsProperties) { super(); }

    public static with(properties: StoreSettingsProperties): StoreSettingsModel {
        return new StoreSettingsModel(properties);
    }

    public static mapModel(Settings: StoreSettings): StoreSettingsModel[] {

        return Settings.map((Setting: StoreSetting) => StoreSettingsModel.with({
            Id: Setting.ID as string,
            StoreName: Setting.StoreName as string,
            Whatsapp: Setting.Whatsapp ?? undefined,
            ContactEmail: Setting.ContactEmail ?? undefined,
            Instagram: Setting.Instagram ?? undefined,
            NotificationEmails: Setting.NotificationEmails ?? undefined,
            PickupAddress: Setting.PickupAddress ?? undefined,
            WhatsappSignature: Setting.WhatsappSignature ?? undefined,
            StoreUrl: Setting.StoreUrl ?? undefined,
            BannerImageType: Setting.BannerImageType ?? undefined,
            BannerImage: (Setting.BannerImage as unknown as Readable) ?? undefined,
            ...this.retrieveAudit(Setting)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get StoreName() { return this.properties.StoreName; }

    public get Whatsapp() { return this.properties.Whatsapp; }

    public get ContactEmail() { return this.properties.ContactEmail; }

    public get Instagram() { return this.properties.Instagram; }

    public get PickupAddress() { return this.properties.PickupAddress; }

    public get WhatsappSignature() { return this.properties.WhatsappSignature; }

    public get StoreUrl() { return this.properties.StoreUrl; }

    public get BannerImageType() { return this.properties.BannerImageType; }

    public get BannerImage() { return this.properties.BannerImage; }

    public get HasBanner() { return Boolean(this.properties.BannerImageType); }

    public get BannerExtension() { return this.properties.BannerImageType?.split('/')[1]; }

    public get ModifiedAt() { return this.properties.ModifiedAt; }

    public static splitEmails(Emails: string | null | undefined): string[] {

        return (Emails ?? '')
            .split(/[,;\s]+/)
            .map((sEmail) => sEmail.trim())
            .filter(Boolean);

    }

    public get NotificationEmailList(): string[] {

        return StoreSettingsModel.splitEmails(this.properties.NotificationEmails);

    }

    public toEntityObject(): StoreSetting {

        return this.cleanEntity({
            ID: this.properties.Id,
            StoreName: this.properties.StoreName,
            Whatsapp: this.properties.Whatsapp,
            ContactEmail: this.properties.ContactEmail,
            Instagram: this.properties.Instagram,
            NotificationEmails: this.properties.NotificationEmails,
            PickupAddress: this.properties.PickupAddress,
            WhatsappSignature: this.properties.WhatsappSignature,
            StoreUrl: this.properties.StoreUrl,
            BannerImageType: this.properties.BannerImageType
        });

    }

}
