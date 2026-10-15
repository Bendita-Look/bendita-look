import { StockEntryService } from '@/services/stock-entry';
import { StockEntryServiceImplementation } from '@/services/stock-entry/implementation';
import { oStockEntryRepositoryFactory } from '../repositories/stock-entry';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oProductRepositoryFactory } from '../repositories/product';

const makeStockEntryService = (): StockEntryService => {

    return new StockEntryServiceImplementation(
        oStockEntryRepositoryFactory,
        oProductVariantRepositoryFactory,
        oProductRepositoryFactory
    );

};

export const oStockEntryServiceFactory = makeStockEntryService();
