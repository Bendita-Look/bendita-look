import { ApplicationService, Request } from '@sap/cds';
import { SalesReport } from '@models/apps/dflc/benditalook/entities';
import { ReportController } from '@/controllers/report';
import { ReportRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class ReportRouteImplementation extends BaseRouteImplementation<SalesReport> implements ReportRoute {

    constructor(protected readonly Controller: ReportController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('SalesReport', this.salesReport.bind(this));

    }


    private async salesReport(Request: Request): Promise<unknown> {

        const oResult = await this.Controller.salesReport(Number(Request.data.Year));

        return this.resultOf(Request, oResult);

    }

}
