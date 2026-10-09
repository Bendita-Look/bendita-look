import { SalesReport } from '@models/apps/dflc/benditalook/entities';
import { ReportService } from '@/services/report';
import { BaseControllerResponse } from '@/controllers/base';
import { ReportController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class ReportControllerImplementation extends BaseControllerImplementation<SalesReport> implements ReportController {

    constructor(protected readonly Service: ReportService) {

        super();

    }


    public async salesReport(Year: number): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.salesReport(Year), 200);

    }

}
