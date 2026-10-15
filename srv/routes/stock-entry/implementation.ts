import { ApplicationService, Request } from '@sap/cds';
import { StockEntry } from '@models/apps/dflc/benditalook/entities';
import { StockEntryController } from '@/controllers/stock-entry';
import { StockEntryRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class StockEntryRouteImplementation extends BaseRouteImplementation<StockEntry> implements StockEntryRoute {

    constructor(protected readonly Controller: StockEntryController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('RegisterStockEntry', this.registerEntry.bind(this));

    }


    private async registerEntry(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.registerEntry(Request.data.Entry));

    }

}
