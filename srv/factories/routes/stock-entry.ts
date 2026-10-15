import { StockEntryRoute } from '@/routes/stock-entry/index';
import { StockEntryRouteImplementation } from '@/routes/stock-entry/implementation';
import { oStockEntryControllerFactory } from '../controllers/stock-entry';

const makeStockEntryRoute = (): StockEntryRoute => {

    return new StockEntryRouteImplementation(oStockEntryControllerFactory);

};

export const oStockEntryRouteFactory = makeStockEntryRoute();
