import { Backup } from '@models/apps/dflc/benditalook/entities';
import { BackupService } from '@/services/backup';
import { BaseControllerResponse } from '@/controllers/base';
import { BackupController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class BackupControllerImplementation extends BaseControllerImplementation<Backup> implements BackupController {

    constructor(protected readonly Service: BackupService) {

        super();

    }


    public async exportBackup(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.exportBackup(), 201);

    }

}
