import { OrderReturnService } from '@/services/order-return';
import { OrderReturnServiceImplementation } from '@/services/order-return/implementation';
import { OrderBuilder } from '@/services/order/order-builder';
import { oOrderReturnRepositoryFactory } from '../repositories/order-return';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oProductImageRepositoryFactory } from '../repositories/product-image';
import { oPricingServiceFactory } from './pricing';
import { oNotificationServiceFactory } from './notification';

const makeOrderReturnService = (): OrderReturnService => {

    return new OrderReturnServiceImplementation(
        oOrderReturnRepositoryFactory,
        oOrderRepositoryFactory,
        oProductVariantRepositoryFactory,
        oPricingServiceFactory,
        new OrderBuilder(oProductImageRepositoryFactory),
        oNotificationServiceFactory
    );

};

export const oOrderReturnServiceFactory = makeOrderReturnService();
