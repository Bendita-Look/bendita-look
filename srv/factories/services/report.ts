import { ReportService } from '@/services/report';
import { ReportServiceImplementation } from '@/services/report/implementation';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oOrderReturnRepositoryFactory } from '../repositories/order-return';
import { oStockEntryRepositoryFactory } from '../repositories/stock-entry';

const makeReportService = (): ReportService => {

    return new ReportServiceImplementation(oOrderRepositoryFactory, oOrderReturnRepositoryFactory, oStockEntryRepositoryFactory);

};

export const oReportServiceFactory = makeReportService();
