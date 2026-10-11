import { PricingService } from '@/services/pricing';
import { PricingServiceImplementation } from '@/services/pricing/implementation';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oPromotionRepositoryFactory } from '../repositories/promotion';

const makePricingService = (): PricingService => {

    return new PricingServiceImplementation(oProductVariantRepositoryFactory, oPromotionRepositoryFactory);

};

export const oPricingServiceFactory = makePricingService();
