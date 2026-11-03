import { StorePolicyRepository } from '@/repositories/store-policy';
import { StorePolicyRepositoryImplementation } from '@/repositories/store-policy/implementation';

const makeStorePolicyRepository = (): StorePolicyRepository => {

    return new StorePolicyRepositoryImplementation();

};

export const oStorePolicyRepositoryFactory = makeStorePolicyRepository();
