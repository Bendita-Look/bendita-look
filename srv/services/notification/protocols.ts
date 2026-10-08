import { OrderModel } from '@/models/order';

export interface NotificationService {
    sendOrderCreated(Order: OrderModel, Locale: string | undefined): Promise<void>;
    sendOrderStatusChanged(Order: OrderModel, Locale: string | undefined): Promise<void>;
}
