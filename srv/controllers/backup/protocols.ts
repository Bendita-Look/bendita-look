import { Backup } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface BackupController extends BaseController<Backup> {
    exportBackup(): Promise<BaseControllerResponse>;
}
