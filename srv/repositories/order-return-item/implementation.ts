import { OrderReturnItemModel } from '@/models/order-return-item';
import { OrderReturnItemRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class OrderReturnItemRepositoryImplementation extends BaseRepositoryImplementation<OrderReturnItemModel> implements OrderReturnItemRepository {

    protected entityName(): string {

        return 'OrderReturnItems';

    }


    protected mapResult(Rows: any[]): OrderReturnItemModel[] {

        return OrderReturnItemModel.mapModel(Rows);

    }

}
