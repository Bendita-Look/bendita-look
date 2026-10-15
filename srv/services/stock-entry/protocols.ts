import { ActionResult, StockEntry, StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface StockEntryService extends BaseService<StockEntry> {
    registerEntry(Input: StockEntryInput): Promise<Either<AbstractError, ActionResult>>;
}
