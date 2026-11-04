import { BackupService } from '@/services/backup';
import { BackupServiceImplementation } from '@/services/backup/implementation';
import { oBackupRepositoryFactory } from '../repositories/backup';
import { oCategoryRepositoryFactory } from '../repositories/category';
import { oProductRepositoryFactory } from '../repositories/product';
import { oProductColorRepositoryFactory } from '../repositories/product-color';
import { oProductImageRepositoryFactory } from '../repositories/product-image';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oProductMeasurementRepositoryFactory } from '../repositories/product-measurement';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oOrderItemRepositoryFactory } from '../repositories/order-item';
import { oStoreSettingsRepositoryFactory } from '../repositories/store-settings';
import { oEmailServerRepositoryFactory } from '../repositories/email-server';
import { oStorePolicyRepositoryFactory } from '../repositories/store-policy';
import { oPromotionRepositoryFactory } from '../repositories/promotion';
import { oOrderPromotionRepositoryFactory } from '../repositories/order-promotion';
import { oOrderReturnRepositoryFactory } from '../repositories/order-return';
import { oOrderReturnItemRepositoryFactory } from '../repositories/order-return-item';
import { oStockEntryRepositoryFactory } from '../repositories/stock-entry';
import { oStockEntryItemRepositoryFactory } from '../repositories/stock-entry-item';
import { oSubscriberRepositoryFactory } from '../repositories/subscriber';
import { oNewsletterCampaignRepositoryFactory } from '../repositories/newsletter-campaign';
import { oPushSubscriptionRepositoryFactory } from '../repositories/push-subscription';
import { oCustomerPushDeviceRepositoryFactory } from '../repositories/customer-push-device';
import { oCustomerPushOrderRepositoryFactory } from '../repositories/customer-push-order';

const makeBackupService = (): BackupService => {

    return new BackupServiceImplementation(
        oBackupRepositoryFactory,
        oCategoryRepositoryFactory,
        oProductImageRepositoryFactory,
        oStoreSettingsRepositoryFactory,
        [
            { name: 'Categories', repository: oCategoryRepositoryFactory },
            { name: 'Products', repository: oProductRepositoryFactory },
            { name: 'ProductColors', repository: oProductColorRepositoryFactory },
            { name: 'ProductVariants', repository: oProductVariantRepositoryFactory },
            { name: 'ProductMeasurements', repository: oProductMeasurementRepositoryFactory },
            { name: 'ProductImages', repository: oProductImageRepositoryFactory },
            { name: 'Promotions', repository: oPromotionRepositoryFactory },
            { name: 'Orders', repository: oOrderRepositoryFactory },
            { name: 'OrderItems', repository: oOrderItemRepositoryFactory },
            { name: 'OrderPromotions', repository: oOrderPromotionRepositoryFactory },
            { name: 'OrderReturns', repository: oOrderReturnRepositoryFactory },
            { name: 'OrderReturnItems', repository: oOrderReturnItemRepositoryFactory },
            { name: 'StockEntries', repository: oStockEntryRepositoryFactory },
            { name: 'StockEntryItems', repository: oStockEntryItemRepositoryFactory },
            { name: 'StoreSettings', repository: oStoreSettingsRepositoryFactory, overwriteExisting: true },
            { name: 'EmailServers', repository: oEmailServerRepositoryFactory },
            { name: 'StorePolicies', repository: oStorePolicyRepositoryFactory },
            { name: 'Subscribers', repository: oSubscriberRepositoryFactory },
            { name: 'NewsletterCampaigns', repository: oNewsletterCampaignRepositoryFactory },
            { name: 'PushSubscriptions', repository: oPushSubscriptionRepositoryFactory },
            { name: 'CustomerPushDevices', repository: oCustomerPushDeviceRepositoryFactory },
            { name: 'CustomerPushOrders', repository: oCustomerPushOrderRepositoryFactory }
        ]
    );

};

export const oBackupServiceFactory = makeBackupService();
