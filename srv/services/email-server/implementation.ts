import cds from '@sap/cds';
import { ActionResult, EmailServer, EmailServerInfo, EmailServerInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { EMAIL_SERVER_ID } from '@/constants/store-settings';
import { EmailSender, EmailServerConfig } from '@/infrastructure/EmailSender';
import { Messages } from '@/infrastructure/Messages';
import { SecretCipher } from '@/infrastructure/SecretCipher';
import { EmailServerModel } from '@/models/email-server';
import { EmailServerRepository } from '@/repositories/email-server';
import { StoreSettingsService } from '@/services/store-settings';
import { EmailServerService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const DEFAULT_PORT = 587;
const PORT_RANGE = { min: 1, max: 65535 };
const PASSWORD_MAX_LENGTH = 200;
const HOST_PATTERN = /^[A-Za-z0-9.-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

enum EmailServerSource {
    Settings = 'SETTINGS',
    Environment = 'ENVIRONMENT',
    None = 'NONE'
}

export class EmailServerServiceImplementation extends BaseServiceImplementation<EmailServer> implements EmailServerService {

    private readonly Sender = new EmailSender(this);

    constructor(
        public readonly Repository: EmailServerRepository,
        private readonly SettingsService: StoreSettingsService
    ) {

        super();

    }


    public async activeServer(): Promise<EmailServerConfig | null> {

        return this.savedServer(await this.Repository.findCurrent()) ?? this.environmentServer();

    }


    public async serverInfo(): Promise<Either<AbstractError, EmailServerInfo>> {

        return this.execute(async () => {

            const oSaved = await this.Repository.findCurrent();
            const oSavedServer = this.savedServer(oSaved);
            const oEnvironment = this.environmentServer();
            const sSource = oSavedServer ? EmailServerSource.Settings : oEnvironment ? EmailServerSource.Environment : EmailServerSource.None;

            return right({
                Host: oSaved?.Host ?? oEnvironment?.Host,
                Port: oSaved?.Port ?? oEnvironment?.Port ?? DEFAULT_PORT,
                Username: oSaved?.Username ?? oEnvironment?.Username,
                Sender: oSaved?.Sender,
                Saved: Boolean(oSaved),
                PasswordReadable: Boolean(oSavedServer),
                Source: sSource
            });

        });

    }


    public async saveServer(Input: EmailServerInput): Promise<Either<AbstractError, ActionResult>> {

        const oValidation = this.validate(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        if (!SecretCipher.isAvailable()) {
            return left(new ValidationError('error.emailSecretUnavailable'));
        }

        return this.execute(async () => {

            const sPassword = Input.Password || this.savedServer(await this.Repository.findCurrent())?.Password;

            if (!sPassword) {
                return left(new ValidationError('error.emailPasswordRequired'));
            }

            await this.Repository.saveCurrent(EmailServerModel.with({
                Id: EMAIL_SERVER_ID,
                Host: (Input.Host as string).trim(),
                Port: Input.Port as number,
                Username: (Input.Username as string).trim(),
                Sender: Input.Sender?.trim() || undefined,
                Password: SecretCipher.encrypt(sPassword)
            }));

            return right({ success: true });

        });

    }


    public async removeServer(): Promise<Either<AbstractError, ActionResult>> {

        return this.execute(async () => {

            await this.Repository.removeCurrent();

            return right({ success: true });

        });

    }


    public async sendTest(Recipient: string, Locale: string | undefined): Promise<Either<AbstractError, ActionResult>> {

        const sRecipient = (Recipient ?? '').trim();

        if (!EMAIL_PATTERN.test(sRecipient)) {
            return left(new ValidationError('error.invalidTestRecipient'));
        }

        return this.execute(async () => {

            const oServer = await this.activeServer();

            if (!oServer) {
                return left(new ValidationError('error.emailServerNotConfigured'));
            }

            const oSettings = await this.SettingsService.currentSettings();

            try {

                await this.Sender.sendWith(oServer, {
                    fromName: oSettings.StoreName,
                    to: sRecipient,
                    replyTo: oSettings.ContactEmail,
                    subject: Messages.text('email.test.subject', Locale, { store: oSettings.StoreName }),
                    html: `<p>${Messages.text('email.test.body', Locale, { store: oSettings.StoreName, server: oServer.Host })}</p>`
                });

            } catch (oError) {

                cds.log('email').warn('Test email failed:', (oError as Error).message);

                return left(new ValidationError('error.emailTestFailed', { reason: (oError as Error).message }));

            }

            return right({ success: true });

        });

    }


    private savedServer(Saved: EmailServerModel | null): EmailServerConfig | null {

        const sPassword = Saved ? SecretCipher.decrypt(Saved.Password) : null;

        if (!Saved || !sPassword) {
            return null;
        }

        return { Host: Saved.Host, Port: Saved.Port, Username: Saved.Username, Sender: Saved.Sender, Password: sPassword };

    }


    private environmentServer(): EmailServerConfig | null {

        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
            return null;
        }

        return { Host: SMTP_HOST, Port: Number(SMTP_PORT || DEFAULT_PORT), Username: SMTP_USER, Password: SMTP_PASSWORD };

    }


    private validate(Input: EmailServerInput): Either<AbstractError, boolean> {

        if (this.isBlank(Input?.Host) || !HOST_PATTERN.test((Input.Host as string).trim())) {
            return left(new ValidationError('error.invalidEmailHost'));
        }

        if (!Number.isInteger(Input.Port) || (Input.Port as number) < PORT_RANGE.min || (Input.Port as number) > PORT_RANGE.max) {
            return left(new ValidationError('error.invalidEmailPort', PORT_RANGE));
        }

        if (this.isBlank(Input.Username)) {
            return left(new ValidationError('error.emailUsernameRequired'));
        }

        if (Input.Sender?.trim() && !EMAIL_PATTERN.test(Input.Sender.trim())) {
            return left(new ValidationError('error.invalidEmailSender'));
        }

        if ((Input.Password ?? '').length > PASSWORD_MAX_LENGTH) {
            return left(new ValidationError('error.emailPasswordTooLong', { max: PASSWORD_MAX_LENGTH }));
        }

        return right(true);

    }

}
