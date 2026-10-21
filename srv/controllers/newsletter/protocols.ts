import {
    NewsletterSendInput,
    NewsletterSubscribeInput,
    Subscriber
} from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface NewsletterController extends BaseController<Subscriber> {
    subscribe(Input: NewsletterSubscribeInput, Locale: string | undefined, ClientIp: string): Promise<BaseControllerResponse>;
    unsubscribe(Token: string, Locale: string | undefined): Promise<BaseControllerResponse>;
    send(Input: NewsletterSendInput, Locale: string | undefined): Promise<BaseControllerResponse>;
}
