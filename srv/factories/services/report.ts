import { ReportService } from '@/services/report';
import { ReportServiceImplementation } from '@/services/report/implementation';
import { oOrderRepositoryFactory } from '../repositories/order';

const makeReportService = (): ReportService => {

    return new ReportServiceImplementation(oOrderRepositoryFactory);

};

export const oReportServiceFactory = makeReportService();
