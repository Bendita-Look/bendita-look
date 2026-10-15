import { ActionResult, EmailServer, EmailServerInfo, EmailServerInput } from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { EmailServerProvider } from '@/infrastructure/EmailSender';
import { BaseService } from '../base';

export interface EmailServerService extends BaseService<EmailServer>, EmailServerProvider {
    serverInfo(): Promise<Either<AbstractError, EmailServerInfo>>;
    saveServer(Input: EmailServerInput): Promise<Either<AbstractError, ActionResult>>;
    removeServer(): Promise<Either<AbstractError, ActionResult>>;
    sendTest(Recipient: string, Locale: string | undefined): Promise<Either<AbstractError, ActionResult>>;
}
