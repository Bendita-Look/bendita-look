import { SubscriberModel } from '@/models/subscriber';
import { BaseRepository } from '../base';

export interface SubscriberRepository extends BaseRepository<SubscriberModel> {
    findActive(): Promise<SubscriberModel[]>;
    findByEmail(Email: string): Promise<SubscriberModel | null>;
    findByToken(Token: string): Promise<SubscriberModel | null>;
}
