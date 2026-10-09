import { SalesReport } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface ReportController extends BaseController<SalesReport> {
    salesReport(Year: number): Promise<BaseControllerResponse>;
}
