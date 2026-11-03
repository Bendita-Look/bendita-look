import { NewsletterCampaignRepository } from '@/repositories/newsletter-campaign';
import { NewsletterCampaignRepositoryImplementation } from '@/repositories/newsletter-campaign/implementation';

const makeNewsletterCampaignRepository = (): NewsletterCampaignRepository => {

    return new NewsletterCampaignRepositoryImplementation();

};

export const oNewsletterCampaignRepositoryFactory = makeNewsletterCampaignRepository();
