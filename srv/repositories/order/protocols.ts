import Decimal from 'decimal.js';
import { OrderSummary } from '@models/apps/dflc/benditalook/entities';
import { OrderDelivery, OrderModel } from '@/models/order';
import { OrderStatus } from '@/constants/order-status';
import { BaseRepository } from '../base';

export type OrderIdentity = {
    ID: string;
    Number: number;
    AccessCode: string;
    Status: OrderStatus;
};

export interface OrderRepository extends BaseRepository<OrderModel> {
    findWithItemsById(Id: string): Promise<OrderModel | null>;
    findWithItemsByAccess(Number: number, AccessCode: string): Promise<OrderModel | null>;
    findWithItemsByPeriod(Start: Date, End: Date): Promise<OrderModel[]>;
    findSummariesByNumbers(Numbers: number[]): Promise<OrderSummary[]>;
    findIdentitiesByNumbers(Numbers: number[]): Promise<OrderIdentity[]>;
    findRecentByCustomerEmail(Email: string, Since: Date, Limit: number): Promise<OrderSummary[]>;
    findNextNumber(): Promise<number>;
    createEntry(Order: OrderModel): Promise<void>;
    updateStatus(Id: string, Status: OrderStatus, Delivery?: OrderDelivery): Promise<void>;
    replaceItems(Order: OrderModel): Promise<void>;
    addReturnTotals(Id: string, Refund: Decimal, Exchange: Decimal): Promise<void>;
    deleteCascade(Id: string): Promise<void>;
}
