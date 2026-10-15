import cds from '@sap/cds';
import { StockEntryModel } from '@/models/stock-entry';
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


    public async createEntry(Entry: StockEntryModel): Promise<void> {

        await cds.run(
            INSERT.into(this.getEntity()).entries({
                ...Entry.toEntityObject(),
                Items: Entry.Items.map((Item) => Item.toEntityObject())
            })
        );

    }


    protected entityName(): string {

        return 'StockEntries';

    }


    protected mapResult(Rows: any[]): StockEntryModel[] {

        return StockEntryModel.mapModel(Rows);

    }

}
