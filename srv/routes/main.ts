import '../configs/module-alias';
import cds from '@sap/cds';
import { oMainRouteFactory } from '@/factories/routes/main';

class BenditaLook extends cds.ApplicationService {

    init(): Promise<void> {

        oMainRouteFactory.main(this);

        return super.init();

    }

}

module.exports = BenditaLook;
