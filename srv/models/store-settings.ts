import { StoreSetting, StoreSettings } from '@models/apps/dflc/benditalook/entities';
import { BaseModel } from './base';

export type StoreSettingsProperties = {
    Id: string;
    StoreName: string;
    Whatsapp?: string;
    ContactEmail?: string;
    Instagram?: string;
    NotificationEmails?: string;
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
            NotificationEmails: Setting.NotificationEmails ?? undefined
        }));

    }

    public get Id() { return this.properties.Id; }

    public get StoreName() { return this.properties.StoreName; }

    public get Whatsapp() { return this.properties.Whatsapp; }

    public get ContactEmail() { return this.properties.ContactEmail; }

    public get Instagram() { return this.properties.Instagram; }

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
            NotificationEmails: this.properties.NotificationEmails
        });

    }

}
