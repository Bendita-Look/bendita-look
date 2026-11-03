import {
    NewsletterSendInput,
    NewsletterSendResult,
    NewsletterSubscribeInput,
    NewsletterSubscribeResult,
    NewsletterUnsubscribeResult,
    Subscriber
} from '@models/apps/dflc/benditalook/entities';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '../base';

export interface NewsletterService extends BaseService<Subscriber> {
    subscribe(Input: NewsletterSubscribeInput, Locale: string | undefined, ClientIp: string): Promise<Either<AbstractError, NewsletterSubscribeResult>>;
    unsubscribe(Token: string, Locale: string | undefined): Promise<Either<AbstractError, NewsletterUnsubscribeResult>>;
    send(Input: NewsletterSendInput, Locale: string | undefined): Promise<Either<AbstractError, NewsletterSendResult>>;
}
