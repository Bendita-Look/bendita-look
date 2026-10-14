import { ReportService } from '@/services/report';
import { ReportServiceImplementation } from '@/services/report/implementation';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oOrderReturnRepositoryFactory } from '../repositories/order-return';

const makeReportService = (): ReportService => {

    return new ReportServiceImplementation(oOrderRepositoryFactory, oOrderReturnRepositoryFactory);

};

export const oReportServiceFactory = makeReportService();
