import { StockEntryModel } from '@/models/stock-entry';
import { BaseRepository } from '../base';

export interface StockEntryRepository extends BaseRepository<StockEntryModel> {
    findByPeriod(Start: Date, End: Date): Promise<StockEntryModel[]>;
    createEntry(Entry: StockEntryModel): Promise<void>;
}
