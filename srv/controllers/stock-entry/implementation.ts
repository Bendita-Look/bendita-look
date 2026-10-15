import { StockEntry, StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { StockEntryService } from '@/services/stock-entry';
import { BaseControllerResponse } from '@/controllers/base';
import { StockEntryController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class StockEntryControllerImplementation extends BaseControllerImplementation<StockEntry> implements StockEntryController {

    constructor(protected readonly Service: StockEntryService) {

        super();

    }


    public async registerEntry(Input: StockEntryInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.registerEntry(Input), 201);

    }

}
