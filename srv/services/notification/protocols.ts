import { OrderModel } from '@/models/order';
import { OrderReturnModel } from '@/models/order-return';

export interface NotificationService {
    sendOrderCreated(Order: OrderModel, Locale: string | undefined): Promise<void>;
    sendOrderStatusChanged(Order: OrderModel, Locale: string | undefined): Promise<void>;
    sendStoreSaleThanks(Order: OrderModel, Locale: string | undefined): Promise<void>;
    sendOrderUpdated(Order: OrderModel, Locale: string | undefined): Promise<void>;
    sendOrderReturn(Order: OrderModel, Return: OrderReturnModel, Locale: string | undefined): Promise<void>;
}
