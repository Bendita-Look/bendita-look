import { OrderPromotionModel } from '@/models/order-promotion';
import { OrderPromotionRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class OrderPromotionRepositoryImplementation extends BaseRepositoryImplementation<OrderPromotionModel> implements OrderPromotionRepository {

    protected entityName(): string {

        return 'OrderPromotions';

    }


    protected mapResult(Rows: any[]): OrderPromotionModel[] {

        return OrderPromotionModel.mapModel(Rows);

    }

}
