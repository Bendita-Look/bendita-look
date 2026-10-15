import { MainRoute } from '@/routes/main/index';
import { MainRouteImplementation } from '@/routes/main/implementation';
import { oCategoryRouteFactory } from './category';
import { oProductRouteFactory } from './product';
import { oOrderRouteFactory } from './order';
import { oOrderReturnRouteFactory } from './order-return';
import { oStockEntryRouteFactory } from './stock-entry';
import { oBackupRouteFactory } from './backup';
import { oReportRouteFactory } from './report';
import { oStoreSettingsRouteFactory } from './store-settings';
import { oEmailServerRouteFactory } from './email-server';
import { oPromotionRouteFactory } from './promotion';

const makeMainRoute = (): MainRoute => {

    return new MainRouteImplementation([
        oCategoryRouteFactory,
        oProductRouteFactory,
        oOrderRouteFactory,
        oOrderReturnRouteFactory,
        oStockEntryRouteFactory,
        oBackupRouteFactory,
        oReportRouteFactory,
        oStoreSettingsRouteFactory,
        oEmailServerRouteFactory,
        oPromotionRouteFactory
    ]);

};

export const oMainRouteFactory = makeMainRoute();
