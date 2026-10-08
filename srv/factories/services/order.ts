import { OrderService } from '@/services/order';
import { OrderServiceImplementation } from '@/services/order/implementation';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { ORDER_LIMITS } from '@/constants/order-limits';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oNotificationServiceFactory } from './notification';

const makeOrderService = (): OrderService => {

    return new OrderServiceImplementation(
        oOrderRepositoryFactory,
        oProductVariantRepositoryFactory,
        oNotificationServiceFactory,
        new RateLimiter(ORDER_LIMITS.maxOrdersPerWindow, ORDER_LIMITS.windowInMinutes)
    );

};

export const oOrderServiceFactory = makeOrderService();
