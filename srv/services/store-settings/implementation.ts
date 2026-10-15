import { User } from '@sap/cds';
import { StoreInfo, StoreSetting } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { STORE_SETTINGS_ID } from '@/constants/store-settings';
import { StoreSettingsModel } from '@/models/store-settings';
import { StoreSettingsRepository } from '@/repositories/store-settings';
import { StoreSettingsService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const DEFAULT_STORE_NAME = 'Bendita Look';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = { min: 10, max: 13 };
const INSTAGRAM_PATTERN = /^@?[A-Za-z0-9._]{1,30}$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

export class StoreSettingsServiceImplementation extends BaseServiceImplementation<StoreSetting> implements StoreSettingsService {

    constructor(public readonly Repository: StoreSettingsRepository) {

        super();

    }


    public async beforeCreate(Settings: StoreSetting, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Settings);

    }


    public async beforeUpdate(Settings: StoreSetting, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Settings);

    }


    public async ensureSettings(): Promise<Either<AbstractError, StoreSettingsModel>> {

        return this.execute(async () => right(await this.currentSettings()));

    }


    public async storeInfo(): Promise<Either<AbstractError, StoreInfo>> {

        return this.execute(async () => {

            const oSettings = await this.currentSettings();

            return right({
                StoreName: oSettings.StoreName,
                Whatsapp: oSettings.Whatsapp,
                ContactEmail: oSettings.ContactEmail,
                Instagram: oSettings.Instagram,
                PickupAddress: oSettings.PickupAddress,
                StoreUrl: oSettings.StoreUrl,
                WhatsappSignature: oSettings.WhatsappSignature,
                BannerId: oSettings.HasBanner ? oSettings.Id : undefined,
                BannerVersion: oSettings.HasBanner ? oSettings.ModifiedAt : undefined
            });

        });

    }


    public async currentSettings(): Promise<StoreSettingsModel> {

        const oSettings = await this.Repository.findCurrent();

        if (oSettings) {
            return oSettings;
        }

        const oDefaults = this.defaultSettings();

        await this.Repository.createEntry(oDefaults);

        return oDefaults;

    }


    private defaultSettings(): StoreSettingsModel {

        return StoreSettingsModel.with({
            Id: STORE_SETTINGS_ID,
            StoreName: process.env.STORE_NAME || DEFAULT_STORE_NAME,
            Whatsapp: process.env.STORE_WHATSAPP,
            ContactEmail: process.env.STORE_EMAIL,
            Instagram: process.env.STORE_INSTAGRAM,
            NotificationEmails: process.env.ADMIN_EMAILS,
            StoreUrl: process.env.STORE_URL
        });

    }


    private validate(Settings: StoreSetting): Either<AbstractError, boolean> {

        if ('StoreName' in Settings && this.isBlank(Settings.StoreName)) {
            return left(new ValidationError('error.storeNameRequired'));
        }

        const iPhoneDigits = (Settings.Whatsapp ?? '').replace(/\D/g, '').length;

        if (Settings.Whatsapp && (iPhoneDigits < PHONE_DIGITS.min || iPhoneDigits > PHONE_DIGITS.max)) {
            return left(new ValidationError('error.invalidStoreWhatsapp'));
        }

        if (Settings.ContactEmail && !EMAIL_PATTERN.test(Settings.ContactEmail.trim())) {
            return left(new ValidationError('error.invalidStoreEmail'));
        }

        if (Settings.Instagram && !INSTAGRAM_PATTERN.test(Settings.Instagram.trim())) {
            return left(new ValidationError('error.invalidInstagram'));
        }

        if (Settings.StoreUrl && !URL_PATTERN.test(Settings.StoreUrl.trim())) {
            return left(new ValidationError('error.invalidStoreUrl'));
        }

        const sInvalidEmail = StoreSettingsModel.splitEmails(Settings.NotificationEmails)
            .find((sEmail) => !EMAIL_PATTERN.test(sEmail));

        if (sInvalidEmail) {
            return left(new ValidationError('error.invalidNotificationEmail', { email: sInvalidEmail }));
        }

        return right(true);

    }

}
