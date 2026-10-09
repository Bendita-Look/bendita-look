import { SalesReport } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface ReportService extends BaseService<SalesReport> {
    salesReport(Year: number): Promise<Either<AbstractError, SalesReport>>;
}
