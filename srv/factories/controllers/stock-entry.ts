import { StockEntryController } from '@/controllers/stock-entry';
import { StockEntryControllerImplementation } from '@/controllers/stock-entry/implementation';
import { oStockEntryServiceFactory } from '../services/stock-entry';

const makeStockEntryController = (): StockEntryController => {

    return new StockEntryControllerImplementation(oStockEntryServiceFactory);

};

export const oStockEntryControllerFactory = makeStockEntryController();
