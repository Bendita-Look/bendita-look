import { ApplicationService, Request } from '@sap/cds';
import { Subscriber } from '@models/apps/dflc/benditalook/entities';
import { NewsletterController } from '@/controllers/newsletter';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { NewsletterRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class NewsletterRouteImplementation extends BaseRouteImplementation<Subscriber> implements NewsletterRoute {

    constructor(protected readonly Controller: NewsletterController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('SendNewsletter', this.sendNewsletter.bind(this));

    }


    public catalog(Service: ApplicationService): void {

        Service.on('Subscribe', this.subscribe.bind(this));

        Service.on('Unsubscribe', this.unsubscribe.bind(this));

    }


    private async subscribe(Request: Request): Promise<unknown> {

        const oResult = await this.Controller.subscribe(Request.data.Input, Request.locale, ServiceLocator.getClientIp());

        return this.resultOf(Request, oResult);

    }


    private async unsubscribe(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.unsubscribe(Request.data.Token, Request.locale));

    }


    private async sendNewsletter(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.send(Request.data.Campaign, Request.locale));

    }

}
