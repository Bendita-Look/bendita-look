import { StockEntryRepository } from '@/repositories/stock-entry';
import { StockEntryRepositoryImplementation } from '@/repositories/stock-entry/implementation';

const makeStockEntryRepository = (): StockEntryRepository => {

    return new StockEntryRepositoryImplementation();

};

export const oStockEntryRepositoryFactory = makeStockEntryRepository();
