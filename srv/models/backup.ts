import { Backup, Backups } from '@models/apps/dflc/benditalook/entities';
import { Readable } from 'stream';
import { AuditProperties, BaseModel } from './base';

export type BackupProperties = AuditProperties & {
    Id: string;
    Backup?: Readable;
    BackupType?: string;
};

export class BackupModel extends BaseModel {

    constructor(private readonly properties: BackupProperties) { super(); }

    public static with(properties: BackupProperties): BackupModel {
        return new BackupModel(properties);
    }

    public static mapModel(Backups: Backups): BackupModel[] {

        return Backups.map((Backup: Backup) => BackupModel.with({
            Id: Backup.ID as string,
            Backup: (Backup.Backup as unknown as Readable) ?? undefined,
            BackupType: Backup.BackupType ?? undefined,
            ...this.retrieveAudit(Backup)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Backup() { return this.properties.Backup; }

}
