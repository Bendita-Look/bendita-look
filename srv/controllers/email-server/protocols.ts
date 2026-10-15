import { EmailServer, EmailServerInput } from '@models/apps/dflc/benditalook/entities';
import { BaseController, BaseControllerResponse } from '@/controllers/base';

export interface EmailServerController extends BaseController<EmailServer> {
    serverInfo(): Promise<BaseControllerResponse>;
    saveServer(Input: EmailServerInput): Promise<BaseControllerResponse>;
    removeServer(): Promise<BaseControllerResponse>;
    sendTest(Recipient: string, Locale: string | undefined): Promise<BaseControllerResponse>;
}
