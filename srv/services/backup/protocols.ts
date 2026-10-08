import { Backup } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface BackupService extends BaseService<Backup> {
    exportBackup(): Promise<Either<AbstractError, string>>;
}
