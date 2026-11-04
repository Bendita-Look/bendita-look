import { StockEntryModel } from '@/models/stock-entry';
import { BaseRepository } from '../base';

export interface StockEntryRepository extends BaseRepository<StockEntryModel> {
    findByPeriod(Start: Date, End: Date): Promise<StockEntryModel[]>;
    findWithItemsById(Id: string): Promise<StockEntryModel | null>;
    createEntry(Entry: StockEntryModel): Promise<void>;
    deleteCascade(Id: string): Promise<void>;
}
