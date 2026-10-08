import { BackupModel } from '@/models/backup';
import { BaseRepository } from '../base';

export interface BackupRepository extends BaseRepository<BackupModel> {
    createEntry(Id: string, Content: Buffer, ContentType: string): Promise<void>;
    deleteEntry(Id: string): Promise<void>;
}
