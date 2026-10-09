import { ReportRoute } from '@/routes/report/index';
import { ReportRouteImplementation } from '@/routes/report/implementation';
import { oReportControllerFactory } from '../controllers/report';

const makeReportRoute = (): ReportRoute => {

    return new ReportRouteImplementation(oReportControllerFactory);

};

export const oReportRouteFactory = makeReportRoute();
