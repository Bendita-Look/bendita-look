import { EmailServerModel } from '@/models/email-server';
import { BaseRepository } from '../base';

export interface EmailServerRepository extends BaseRepository<EmailServerModel> {
    findCurrent(): Promise<EmailServerModel | null>;
    saveCurrent(Server: EmailServerModel): Promise<void>;
    removeCurrent(): Promise<void>;
}
