import { ReportController } from '@/controllers/report';
import { ReportControllerImplementation } from '@/controllers/report/implementation';
import { oReportServiceFactory } from '../services/report';

const makeReportController = (): ReportController => {

    return new ReportControllerImplementation(oReportServiceFactory);

};

export const oReportControllerFactory = makeReportController();
