import { StockEntry, StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface StockEntryController extends BaseController<StockEntry> {
    registerEntry(Input: StockEntryInput): Promise<BaseControllerResponse>;
}
