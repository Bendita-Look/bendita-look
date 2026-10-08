import { OrderModel } from '@/models/order';
import { OrderStatus } from '@/constants/order-status';
import { BaseRepository } from '../base';

export interface OrderRepository extends BaseRepository<OrderModel> {
    findWithItemsById(Id: string): Promise<OrderModel | null>;
    findWithItemsByAccess(Number: number, AccessCode: string): Promise<OrderModel | null>;
    findNextNumber(): Promise<number>;
    createEntry(Order: OrderModel): Promise<void>;
    updateStatus(Id: string, Status: OrderStatus): Promise<void>;
}
