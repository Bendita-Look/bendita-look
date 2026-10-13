import cds from '@sap/cds';
import { StoreSettingsModel } from '@/models/store-settings';
import { STORE_SETTINGS_ID } from '@/constants/store-settings';
import { StoreSettingsRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class StoreSettingsRepositoryImplementation extends BaseRepositoryImplementation<StoreSettingsModel> implements StoreSettingsRepository {

    public async findCurrent(): Promise<StoreSettingsModel | null> {

        return this.findById(STORE_SETTINGS_ID);

    }


    public async createEntry(Settings: StoreSettingsModel): Promise<void> {

        await cds.run(INSERT.into(this.getEntity()).entries(Settings.toEntityObject()));

    }


    public async findBannerContent(): Promise<StoreSettingsModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .columns('ID', 'StoreName', 'BannerImage', 'BannerImageType')
                .where({ ID: STORE_SETTINGS_ID })
        );

        return this.mapResult(oRows)[0] ?? null;

    }


    protected entityName(): string {

        return 'StoreSettings';

    }


    protected mapResult(Rows: any[]): StoreSettingsModel[] {

        return StoreSettingsModel.mapModel(Rows);

    }

}
