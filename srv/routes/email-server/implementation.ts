import { ApplicationService, Request } from '@sap/cds';
import { EmailServer } from '@models/apps/dflc/benditalook/entities';
import { EmailServerController } from '@/controllers/email-server';
import { EmailServerRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class EmailServerRouteImplementation extends BaseRouteImplementation<EmailServer> implements EmailServerRoute {

    constructor(protected readonly Controller: EmailServerController) {

        super();

    }


    public main(Service: ApplicationService): void {

        Service.on('EmailServer', this.serverInfo.bind(this));
        Service.on('SaveEmailServer', this.saveServer.bind(this));
        Service.on('RemoveEmailServer', this.removeServer.bind(this));
        Service.on('SendTestEmail', this.sendTest.bind(this));

    }


    private async serverInfo(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.serverInfo());

    }


    private async saveServer(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.saveServer(Request.data.Server));

    }


    private async removeServer(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.removeServer());

    }


    private async sendTest(Request: Request): Promise<unknown> {

        return this.resultOf(Request, await this.Controller.sendTest(Request.data.Recipient, Request.locale));

    }

}
