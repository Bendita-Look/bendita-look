import cds from '@sap/cds';
import { BackupModel } from '@/models/backup';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { BackupRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class BackupRepositoryImplementation extends BaseRepositoryImplementation<BackupModel> implements BackupRepository {

    public async createEntry(Id: string, Content: Buffer, ContentType: string): Promise<void> {

        await cds.run(
            INSERT.into(this.getEntity()).entries({
                ID: Id,
                Backup: Content,
                BackupType: ContentType
            })
        );

    }


    public async deleteEntry(Id: string): Promise<void> {

        await cds.run(DELETE.from(this.getEntity()).where({ ID: Id }));

    }


    public async findDraftContent(Id: string): Promise<unknown> {

        const oDraft = await cds.run(
            SELECT.one.from(ServiceLocator.getDraftEntity(this.entityName())).columns('Backup').where({ ID: Id })
        );

        return oDraft?.Backup;

    }


    protected entityName(): string {

        return 'Backups';

    }


    protected mapResult(Rows: any[]): BackupModel[] {

        return BackupModel.mapModel(Rows);

    }

}
