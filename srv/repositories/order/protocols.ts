import Decimal from 'decimal.js';
import { OrderDelivery, OrderModel } from '@/models/order';
import { OrderStatus } from '@/constants/order-status';
import { BaseRepository } from '../base';

export interface OrderRepository extends BaseRepository<OrderModel> {
    findWithItemsById(Id: string): Promise<OrderModel | null>;
    findWithItemsByAccess(Number: number, AccessCode: string): Promise<OrderModel | null>;
    findWithItemsByPeriod(Start: Date, End: Date): Promise<OrderModel[]>;
    findNextNumber(): Promise<number>;
    createEntry(Order: OrderModel): Promise<void>;
    updateStatus(Id: string, Status: OrderStatus, Delivery?: OrderDelivery): Promise<void>;
    replaceItems(Order: OrderModel): Promise<void>;
    addReturnTotals(Id: string, Refund: Decimal, Exchange: Decimal): Promise<void>;
}
