import { BackupService } from '@/services/backup';
import { BackupServiceImplementation } from '@/services/backup/implementation';
import { oBackupRepositoryFactory } from '../repositories/backup';
import { oCategoryRepositoryFactory } from '../repositories/category';
import { oProductRepositoryFactory } from '../repositories/product';
import { oProductColorRepositoryFactory } from '../repositories/product-color';
import { oProductImageRepositoryFactory } from '../repositories/product-image';
import { oProductVariantRepositoryFactory } from '../repositories/product-variant';
import { oOrderRepositoryFactory } from '../repositories/order';
import { oOrderItemRepositoryFactory } from '../repositories/order-item';

const makeBackupService = (): BackupService => {

    return new BackupServiceImplementation(
        oBackupRepositoryFactory,
        oProductImageRepositoryFactory,
        [
            { name: 'Categories', repository: oCategoryRepositoryFactory },
            { name: 'Products', repository: oProductRepositoryFactory },
            { name: 'ProductColors', repository: oProductColorRepositoryFactory },
            { name: 'ProductVariants', repository: oProductVariantRepositoryFactory },
            { name: 'ProductImages', repository: oProductImageRepositoryFactory },
            { name: 'Orders', repository: oOrderRepositoryFactory },
            { name: 'OrderItems', repository: oOrderItemRepositoryFactory }
        ]
    );

};

export const oBackupServiceFactory = makeBackupService();
