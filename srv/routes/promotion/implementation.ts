import { ApplicationService, Request } from '@sap/cds';
import { Promotion } from '@models/apps/dflc/benditalook/entities';
import { PromotionController } from '@/controllers/promotion';
import { PromotionRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class PromotionRouteImplementation extends BaseRouteImplementation<Promotion> implements PromotionRoute {

    constructor(protected readonly Controller: PromotionController) {

        super();

    }


    public main(Service: ApplicationService): void {

        this.mainBase(Service, Service.entities.Promotions);

    }


    public catalog(Service: ApplicationService): void {

        Service.on('ActivePromotions', this.activePromotions.bind(this));

    }


    private async activePromotions(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.activePromotions());

    }

}
