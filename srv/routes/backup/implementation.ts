import { ApplicationService, Request } from '@sap/cds';
import { Backup } from '@models/apps/dflc/benditalook/entities';
import { BackupController } from '@/controllers/backup';
import { BackupRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class BackupRouteImplementation extends BaseRouteImplementation<Backup> implements BackupRoute {

    constructor(protected readonly Controller: BackupController) {

        super();

    }


    public main(Service: ApplicationService): void {

        this.mainBase(Service, Service.entities.Backups);

        Service.on('ExportBackup', this.exportBackup.bind(this));

    }


    private async exportBackup(Request: Request): Promise<unknown> {

        const oResult = await this.Controller.exportBackup();

        const sBackupId = this.resultOf(Request, oResult);

        return { success: true, data: sBackupId };

    }

}
