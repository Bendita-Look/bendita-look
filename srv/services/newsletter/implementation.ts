import { randomBytes } from 'crypto';
import path from 'path';
import cds from '@sap/cds';
import {
    NewsletterSendInput,
    NewsletterSendResult,
    NewsletterSubscribeInput,
    NewsletterSubscribeResult,
    NewsletterUnsubscribeResult,
    Subscriber
} from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { EmailAttachment, EmailSender } from '@/infrastructure/EmailSender';
import { Messages } from '@/infrastructure/Messages';
import { RateLimiter } from '@/infrastructure/RateLimiter';
import { StoreUrl } from '@/infrastructure/StoreUrl';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { StoreSettingsModel } from '@/models/store-settings';
import { SubscriberModel } from '@/models/subscriber';
import { NewsletterCampaignRepository } from '@/repositories/newsletter-campaign';
import { SubscriberRepository } from '@/repositories/subscriber';
import { EmailServerService } from '@/services/email-server';
import { StoreSettingsService } from '@/services/store-settings';
import { NewsletterService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 120;
const SUBJECT_MAX_LENGTH = 160;
const TOKEN_BYTES = 24;
const TEMPLATE_NAME = 'newsletter';
const LOGO_CID = 'logo';
const LOGO_FILE = 'logo.png';
const UNSUBSCRIBE_PATH = 'unsubscribe';

export class NewsletterServiceImplementation extends BaseServiceImplementation<Subscriber> implements NewsletterService {

    private readonly Sender: EmailSender;


    constructor(
        private readonly Repository: SubscriberRepository,
        private readonly CampaignRepository: NewsletterCampaignRepository,
        private readonly SettingsService: StoreSettingsService,
        private readonly TemplateRenderer: TemplateRenderer,
        private readonly EmailServer: EmailServerService,
        private readonly SubscribeLimiter: RateLimiter,
        private readonly TemplatesDirectory: string
    ) {

        super();

        this.Sender = new EmailSender(EmailServer);

    }


    public async subscribe(Input: NewsletterSubscribeInput, Locale: string | undefined, ClientIp: string): Promise<Either<AbstractError, NewsletterSubscribeResult>> {

        const oValidation = this.validateSubscribe(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        if (!this.SubscribeLimiter.tryConsume(ClientIp || 'unknown')) {
            return left(new ValidationError('error.tooManySubscribeAttempts'));
        }

        const sEmail = (Input.Email ?? '').trim().toLowerCase();
        const sName = Input.Name?.trim() || null;

        return this.execute<NewsletterSubscribeResult>(async () => {

            const oExisting = await this.Repository.findByEmail(sEmail);

            if (oExisting?.Active) {
                return right({
                    Subscribed: true,
                    AlreadySubscribed: true,
                    Message: Messages.text('newsletter.alreadySubscribed', Locale)
                });
            }

            const sToken = oExisting?.Token || this.generateToken();
            const sNow = new Date().toISOString();

            const oSubscriber = SubscriberModel.with({
                Id: oExisting?.Id ?? this.generateUUID(),
                Name: sName ?? undefined,
                Email: sEmail,
                Active: true,
                Token: sToken,
                ConsentAt: sNow,
                UnsubscribedAt: undefined
            });

            await this.Repository.upsertEntries([oSubscriber.toEntityObject()]);

            return right({
                Subscribed: true,
                AlreadySubscribed: false,
                Message: Messages.text('newsletter.subscribed', Locale)
            });

        });

    }


    public async unsubscribe(Token: string, Locale: string | undefined): Promise<Either<AbstractError, NewsletterUnsubscribeResult>> {

        if (this.isBlank(Token)) {
            return left(new ValidationError('error.invalidUnsubscribeToken'));
        }

        return this.execute<NewsletterUnsubscribeResult>(async () => {

            const oSubscriber = await this.Repository.findByToken(Token.trim());

            if (!oSubscriber) {
                return left(new ValidationError('error.invalidUnsubscribeToken'));
            }

            if (!oSubscriber.Active) {
                return right({
                    Unsubscribed: true,
                    Message: Messages.text('newsletter.alreadyUnsubscribed', Locale)
                });
            }

            await this.Repository.upsertEntries([{
                ID: oSubscriber.Id,
                Active: false,
                UnsubscribedAt: new Date().toISOString()
            }]);

            return right({
                Unsubscribed: true,
                Message: Messages.text('newsletter.unsubscribed', Locale)
            });

        });

    }


    public async send(Input: NewsletterSendInput, Locale: string | undefined): Promise<Either<AbstractError, NewsletterSendResult>> {

        const oValidation = this.validateSend(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        return this.execute<NewsletterSendResult>(async () => {

            const oServer = await this.EmailServer.activeServer();

            if (!oServer) {
                return left(new ValidationError('error.emailServerNotConfigured'));
            }

            const oSettings = await this.SettingsService.currentSettings();
            const oSubscribers = await this.Repository.findActive();

            if (!oSubscribers.length) {
                return left(new ValidationError('error.noSubscribers'));
            }

            const sSubject = (Input.Subject ?? '').trim();
            const sBody = Input.Body ?? '';
            let iSent = 0;
            let iFailed = 0;

            for (const oSubscriber of oSubscribers) {

                try {

                    await this.Sender.sendWith(oServer, {
                        fromName: oSettings.StoreName,
                        to: oSubscriber.Email,
                        replyTo: oSettings.ContactEmail,
                        subject: sSubject,
                        html: this.render(oSettings, sBody, oSubscriber, Locale),
                        attachments: [this.logoAttachment()]
                    });

                    iSent++;

                } catch (oError) {

                    iFailed++;

                    cds.log('newsletter').warn(`Failed to send to subscriber ${oSubscriber.Id}:`, (oError as Error).message);

                }

            }

            await this.CampaignRepository.upsertEntries([{
                ID: this.generateUUID(),
                Subject: sSubject,
                Body: sBody,
                Status: 'SENT',
                SentAt: new Date().toISOString(),
                RecipientCount: iSent,
                FailureCount: iFailed
            }]);

            return right({
                Sent: iSent > 0,
                Recipients: iSent,
                Failures: iFailed,
                Message: Messages.text('newsletter.sent', Locale, { sent: iSent, failed: iFailed })
            });

        });

    }


    private render(Settings: StoreSettingsModel, Body: string, Subscriber: SubscriberModel, Locale: string | undefined): string {

        return this.TemplateRenderer.render(TEMPLATE_NAME, {
            language: Locale || 'pt',
            storeName: Settings.StoreName,
            contactEmail: Settings.ContactEmail,
            whatsapp: Settings.Whatsapp,
            instagram: Settings.Instagram,
            body: Body,
            greeting: Subscriber.Name
                ? Messages.text('newsletter.greetingNamed', Locale, { name: Subscriber.Name })
                : Messages.text('newsletter.greeting', Locale),
            unsubscribeLabel: Messages.text('newsletter.unsubscribeLabel', Locale),
            unsubscribeUrl: this.unsubscribeUrl(Settings, Subscriber.Token),
            footer: Messages.text('newsletter.footer', Locale, { store: Settings.StoreName })
        });

    }


    private logoAttachment(): EmailAttachment {

        return { filename: LOGO_FILE, path: path.join(this.TemplatesDirectory, LOGO_FILE), cid: LOGO_CID };

    }


    private unsubscribeUrl(Settings: StoreSettingsModel, Token: string): string {

        return `${StoreUrl.rootOf(Settings.StoreUrl)}#/${UNSUBSCRIBE_PATH}/${encodeURIComponent(Token)}`;

    }


    private generateToken(): string {

        return randomBytes(TOKEN_BYTES).toString('hex');

    }


    private validateSubscribe(Input: NewsletterSubscribeInput): Either<AbstractError, boolean> {

        const sEmail = (Input?.Email ?? '').trim();

        if (this.isBlank(sEmail) || sEmail.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(sEmail)) {
            return left(new ValidationError('error.invalidSubscriberEmail'));
        }

        if ((Input?.Name ?? '').trim().length > NAME_MAX_LENGTH) {
            return left(new ValidationError('error.subscriberNameTooLong', { max: NAME_MAX_LENGTH }));
        }

        return right(true);

    }


    private validateSend(Input: NewsletterSendInput): Either<AbstractError, boolean> {

        const sSubject = (Input?.Subject ?? '').trim();

        if (this.isBlank(sSubject)) {
            return left(new ValidationError('error.newsletterSubjectRequired'));
        }

        if (sSubject.length > SUBJECT_MAX_LENGTH) {
            return left(new ValidationError('error.newsletterSubjectTooLong', { max: SUBJECT_MAX_LENGTH }));
        }

        if (this.isBlank(Input?.Body)) {
            return left(new ValidationError('error.newsletterBodyRequired'));
        }

        return right(true);

    }

}
