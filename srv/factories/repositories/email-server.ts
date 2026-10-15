import { EmailServerRepository } from '@/repositories/email-server';
import { EmailServerRepositoryImplementation } from '@/repositories/email-server/implementation';

const makeEmailServerRepository = (): EmailServerRepository => {

    return new EmailServerRepositoryImplementation();

};

export const oEmailServerRepositoryFactory = makeEmailServerRepository();
