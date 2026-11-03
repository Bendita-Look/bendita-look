import { StorePolicyModel } from '@/models/store-policy';
import { BaseRepository } from '../base';

export interface StorePolicyRepository extends BaseRepository<StorePolicyModel> {
    findActive(): Promise<StorePolicyModel[]>;
}
