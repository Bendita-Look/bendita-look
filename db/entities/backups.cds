namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Backups : cuid, managed {
    @Core.MediaType  : BackupType
    Backup     : LargeBinary @stream;

    @Core.IsMediaType: true
    BackupType : String;
}
