import { User } from '@sap/cds';
import AdmZip from 'adm-zip';
import excel from 'exceljs';
import { Backup } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { BaseRepository } from '@/repositories/base';
import { BackupRepository } from '@/repositories/backup';
import { ProductImageRepository } from '@/repositories/product-image';
import { StoreSettingsRepository } from '@/repositories/store-settings';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { StreamConverter } from '@/infrastructure/StreamConverter';
import { BackupService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type ExportableModel = { toEntityObject(): object };

type BackupRow = Record<string, unknown> & { ID?: string; ImageType?: string; BannerImageType?: string };

export type BackupTable = {
    name: string;
    repository: BaseRepository<ExportableModel>;
    overwriteExisting?: boolean;
};

const WORKBOOK_NAME = 'BenditaLook.xlsx';
const BACKUP_CONTENT_TYPE = 'application/zip';
const IMAGES_TABLE = 'ProductImages';
const SETTINGS_TABLE = 'StoreSettings';
const BANNER_FILE = 'banner';

export class BackupServiceImplementation extends BaseServiceImplementation<Backup> implements BackupService {

    constructor(
        public readonly Repository: BackupRepository,
        private readonly ImageRepository: ProductImageRepository,
        private readonly SettingsRepository: StoreSettingsRepository,
        private readonly Tables: BackupTable[]
    ) {

        super();

    }


    public async beforeCreate(Backup: Backup, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.importBackup(Backup);

    }


    public async beforeUpdate(Backup: Backup, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.importBackup(Backup);

    }


    public async exportBackup(): Promise<Either<AbstractError, string>> {

        return this.execute(async () => {

            const oZip = new AdmZip();
            const oWorkbook = new excel.Workbook();

            for (const oTable of this.Tables) {

                const aRows = (await oTable.repository.findAll()).map((oModel) => oModel.toEntityObject() as BackupRow);

                this.addWorksheet(oWorkbook, oTable.name, aRows);

            }

            await this.addImages(oZip);
            await this.addBanner(oZip);

            oZip.addFile(WORKBOOK_NAME, Buffer.from(await oWorkbook.xlsx.writeBuffer()));

            const sBackupId = this.generateUUID();

            await this.Repository.createEntry(sBackupId, oZip.toBuffer(), BACKUP_CONTENT_TYPE);

            return right(sBackupId);

        });

    }


    private async importBackup(Backup: Backup): Promise<Either<AbstractError, boolean>> {

        return this.execute(async () => {

            const oContent = await StreamConverter.toBuffer(Backup?.Backup);

            if (!oContent) {
                return right(true);
            }

            const oZip = new AdmZip(oContent);
            const oWorkbookEntry = oZip.getEntries().find((oEntry) => oEntry.entryName.endsWith('.xlsx'));

            if (!oWorkbookEntry) {
                return left(new ValidationError('error.backupExcelNotFound'));
            }

            const oWorkbook = new excel.Workbook();

            await oWorkbook.xlsx.load(oWorkbookEntry.getData() as any);

            for (const oTable of this.Tables) {

                await this.importTable(oTable, oWorkbook, oZip);

            }

            const sBackupId = Backup.ID as string;

            ServiceLocator.afterCommit(() => this.Repository.deleteEntry(sBackupId));

            return right(true);

        });

    }


    private async importTable(Table: BackupTable, Workbook: excel.Workbook, Zip: AdmZip): Promise<void> {

        const oSheet = Workbook.getWorksheet(Table.name);

        if (!oSheet) {
            return;
        }

        const aRows = this.extractRows(oSheet);
        const aExisting = Table.overwriteExisting ? [] : await Table.repository.findByIds(aRows.map((oRow) => oRow.ID as string));
        const oExistingIds = new Set(aExisting.map((oModel) => (oModel.toEntityObject() as BackupRow).ID));

        const aNewRows = aRows
            .filter((oRow) => !oExistingIds.has(oRow.ID))
            .map((oRow) => this.attachMedia(Table.name, oRow, Zip));

        await Table.repository.upsertEntries(aNewRows);

    }


    private addWorksheet(Workbook: excel.Workbook, Name: string, Rows: BackupRow[]): void {

        const oSheet = Workbook.addWorksheet(Name);
        const aColumns = [...new Set(Rows.flatMap((oRow) => Object.keys(oRow)))];

        oSheet.columns = aColumns.map((sColumn) => ({ header: sColumn, key: sColumn }));
        oSheet.addRows(Rows);

    }


    private async addImages(Zip: AdmZip): Promise<void> {

        const aImages = await this.ImageRepository.findAll();

        for (const oImage of aImages) {

            const oImageWithContent = await this.ImageRepository.findContentById(oImage.Id);
            const oBuffer = await StreamConverter.toBuffer(oImageWithContent?.Image);

            if (oBuffer && oImage.FileExtension) {
                Zip.addFile(`${oImage.Id}.${oImage.FileExtension}`, oBuffer);
            }

        }

    }


    private async addBanner(Zip: AdmZip): Promise<void> {

        const oSettings = await this.SettingsRepository.findBannerContent();
        const oBuffer = await StreamConverter.toBuffer(oSettings?.BannerImage);

        if (oBuffer && oSettings?.BannerExtension) {
            Zip.addFile(`${BANNER_FILE}.${oSettings.BannerExtension}`, oBuffer);
        }

    }


    private attachMedia(TableName: string, Row: BackupRow, Zip: AdmZip): BackupRow {

        if (TableName === IMAGES_TABLE) {
            return this.attachImage(Row, Zip);
        }

        return TableName === SETTINGS_TABLE ? this.attachBanner(Row, Zip) : Row;

    }


    private attachBanner(Row: BackupRow, Zip: AdmZip): BackupRow {

        const sExtension = Row.BannerImageType?.split('/')[1];
        const oEntry = sExtension ? Zip.getEntry(`${BANNER_FILE}.${sExtension}`) : null;

        return oEntry ? { ...Row, BannerImage: oEntry.getData() } : { ...Row, BannerImageType: undefined };

    }


    private attachImage(Row: BackupRow, Zip: AdmZip): BackupRow {

        const sExtension = Row.ImageType?.split('/')[1];
        const oEntry = sExtension ? Zip.getEntry(`${Row.ID}.${sExtension}`) : null;

        return oEntry ? { ...Row, Image: oEntry.getData() } : Row;

    }


    private extractRows(Sheet: excel.Worksheet): BackupRow[] {

        const aHeader = (Sheet.getRow(1).values as excel.CellValue[]).slice(1).map(String);
        const aRows: BackupRow[] = [];

        Sheet.eachRow((oRow, iRowNumber) => {

            if (iRowNumber === 1) {
                return;
            }

            const oEntry: BackupRow = {};

            aHeader.forEach((sColumn, iIndex) => {

                const oValue = oRow.getCell(iIndex + 1).value;

                if (oValue !== null && oValue !== undefined && oValue !== '') {
                    oEntry[sColumn] = oValue;
                }

            });

            aRows.push(oEntry);

        });

        return aRows;

    }

}
