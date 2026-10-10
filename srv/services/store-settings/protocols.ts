import { StoreInfo, StoreSetting } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { StoreSettingsModel } from '@/models/store-settings';
import { BaseService } from '../base';

export interface StoreSettingsService extends BaseService<StoreSetting> {
    ensureSettings(): Promise<Either<AbstractError, StoreSettingsModel>>;
    storeInfo(): Promise<Either<AbstractError, StoreInfo>>;
    currentSettings(): Promise<StoreSettingsModel>;
}
