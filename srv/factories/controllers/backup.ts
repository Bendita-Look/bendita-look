import { BackupController } from '@/controllers/backup';
import { BackupControllerImplementation } from '@/controllers/backup/implementation';
import { oBackupServiceFactory } from '../services/backup';

const makeBackupController = (): BackupController => {

    return new BackupControllerImplementation(oBackupServiceFactory);

};

export const oBackupControllerFactory = makeBackupController();
