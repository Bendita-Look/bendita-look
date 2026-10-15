import { EmailServer, EmailServerInput } from '@models/apps/dflc/benditalook/entities';
import { EmailServerService } from '@/services/email-server';
import { BaseControllerResponse } from '@/controllers/base';
import { EmailServerController } from './protocols';
import { BaseControllerImplementation } from '../base/implementation';

export class EmailServerControllerImplementation extends BaseControllerImplementation<EmailServer> implements EmailServerController {

    constructor(protected readonly Service: EmailServerService) {

        super();

    }


    public async serverInfo(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.serverInfo(), 200);

    }


    public async saveServer(Input: EmailServerInput): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.saveServer(Input), 200);

    }


    public async removeServer(): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.removeServer(), 200);

    }


    public async sendTest(Recipient: string, Locale: string | undefined): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.sendTest(Recipient, Locale), 200);

    }

}
