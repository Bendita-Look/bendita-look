import { MainRoute } from '@/routes/main/index';
import { MainRouteImplementation } from '@/routes/main/implementation';
import { oCategoryRouteFactory } from './category';
import { oProductRouteFactory } from './product';
import { oOrderRouteFactory } from './order';
import { oBackupRouteFactory } from './backup';
import { oReportRouteFactory } from './report';
import { oStoreSettingsRouteFactory } from './store-settings';

const makeMainRoute = (): MainRoute => {

    return new MainRouteImplementation([
        oCategoryRouteFactory,
        oProductRouteFactory,
        oOrderRouteFactory,
        oBackupRouteFactory,
        oReportRouteFactory,
        oStoreSettingsRouteFactory
    ]);

};

export const oMainRouteFactory = makeMainRoute();
