import '../configs/module-alias';
import cds from '@sap/cds';
import { oCatalogRouteFactory } from '@/factories/routes/catalog';

class Catalog extends cds.ApplicationService {

    init(): Promise<void> {

        oCatalogRouteFactory.main(this);

        return super.init();

    }

}

module.exports = Catalog;
