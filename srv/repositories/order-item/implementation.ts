import { OrderItemModel } from '@/models/order-item';
import { OrderItemRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class OrderItemRepositoryImplementation extends BaseRepositoryImplementation<OrderItemModel> implements OrderItemRepository {

    protected entityName(): string {

        return 'OrderItems';

    }


    protected mapResult(Rows: any[]): OrderItemModel[] {

        return OrderItemModel.mapModel(Rows);

    }

}
