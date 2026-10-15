import { StockEntryItemModel } from '@/models/stock-entry-item';
import { StockEntryItemRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class StockEntryItemRepositoryImplementation extends BaseRepositoryImplementation<StockEntryItemModel> implements StockEntryItemRepository {

    protected entityName(): string {

        return 'StockEntryItems';

    }


    protected mapResult(Rows: any[]): StockEntryItemModel[] {

        return StockEntryItemModel.mapModel(Rows);

    }

}
