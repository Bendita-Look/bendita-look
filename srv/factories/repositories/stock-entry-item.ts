import { StockEntryItemRepository } from '@/repositories/stock-entry-item';
import { StockEntryItemRepositoryImplementation } from '@/repositories/stock-entry-item/implementation';

const makeStockEntryItemRepository = (): StockEntryItemRepository => {

    return new StockEntryItemRepositoryImplementation();

};

export const oStockEntryItemRepositoryFactory = makeStockEntryItemRepository();
