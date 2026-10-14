import { OrderReturnModel } from '@/models/order-return';
import { BaseRepository } from '../base';

export interface OrderReturnRepository extends BaseRepository<OrderReturnModel> {
    findWithItemsByPeriod(Start: Date, End: Date): Promise<OrderReturnModel[]>;
    createEntry(Return: OrderReturnModel): Promise<void>;
}
