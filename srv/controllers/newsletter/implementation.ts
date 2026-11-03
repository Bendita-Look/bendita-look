import {
    NewsletterSendInput,
    NewsletterSubscribeInput,
    Subscriber
} from '@models/apps/dflc/benditalook/entities';
import { NewsletterService } from '@/services/newsletter';
import { BaseControllerResponse } from '@/controllers/base';
import { NewsletterController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class NewsletterControllerImplementation extends BaseControllerImplementation<Subscriber> implements NewsletterController {

    constructor(protected readonly Service: NewsletterService) {

        super();

    }


    public async subscribe(Input: NewsletterSubscribeInput, Locale: string | undefined, ClientIp: string): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.subscribe(Input, Locale, ClientIp), 201);

    }


    public async unsubscribe(Token: string, Locale: string | undefined): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.unsubscribe(Token, Locale), 200);

    }


    public async send(Input: NewsletterSendInput, Locale: string | undefined): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.send(Input, Locale), 200);

    }

}
