import cds from '@sap/cds';
import { StockEntryModel } from '@/models/stock-entry';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { StockEntryRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class StockEntryRepositoryImplementation extends BaseRepositoryImplementation<StockEntryModel> implements StockEntryRepository {

    public async findByPeriod(Start: Date, End: Date): Promise<StockEntryModel[]> {

        const aEntries = await cds.run(
            SELECT.from(this.getEntity())
                .where`createdAt >= ${Start.toISOString()} and createdAt < ${End.toISOString()}`
        );

        return this.mapResult(aEntries);

    }


    public async findWithItemsById(Id: string): Promise<StockEntryModel | null> {

        const oEntry = await cds.run(SELECT.one.from(this.getEntity()).where({ ID: Id }));

        if (!oEntry) {
            return null;
        }

        const aItems = await cds.run(SELECT.from(ServiceLocator.getEntity('StockEntryItems')).where({ Entry_ID: Id }));

        return this.mapResult([{ ...oEntry, Items: aItems }])[0];

    }


    public async createEntry(Entry: StockEntryModel): Promise<void> {

        await cds.run(
            INSERT.into(this.getEntity()).entries({
                ...Entry.toEntityObject(),
                Items: Entry.Items.map((Item) => Item.toEntityObject())
            })
        );

    }


    public async deleteCascade(Id: string): Promise<void> {

        await cds.run(DELETE.from(ServiceLocator.getEntity('StockEntryItems')).where({ Entry_ID: Id }));
        await cds.run(DELETE.from(this.getEntity()).where({ ID: Id }));

    }


    protected entityName(): string {

        return 'StockEntries';

    }


    protected mapResult(Rows: any[]): StockEntryModel[] {

        return StockEntryModel.mapModel(Rows);

    }

}
