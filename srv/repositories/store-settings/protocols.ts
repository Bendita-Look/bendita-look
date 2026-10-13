import { StoreSettingsModel } from '@/models/store-settings';
import { BaseRepository } from '../base';

export interface StoreSettingsRepository extends BaseRepository<StoreSettingsModel> {
    findCurrent(): Promise<StoreSettingsModel | null>;
    createEntry(Settings: StoreSettingsModel): Promise<void>;
    findBannerContent(): Promise<StoreSettingsModel | null>;
}
