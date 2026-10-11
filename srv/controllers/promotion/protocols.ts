import { Promotion } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface PromotionController extends BaseController<Promotion> {
    activePromotions(): Promise<BaseControllerResponse>;
}
