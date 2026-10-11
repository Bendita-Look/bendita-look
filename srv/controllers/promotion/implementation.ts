import { Promotion } from '@models/apps/dflc/benditalook/entities';
import { PromotionService } from '@/services/promotion';
import { BaseControllerResponse } from '@/controllers/base';
import { PromotionController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class PromotionControllerImplementation extends BaseControllerImplementation<Promotion> implements PromotionController {

    constructor(protected readonly Service: PromotionService) {

        super();

    }


    public async activePromotions(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.activePromotions(), 200);

    }

}
