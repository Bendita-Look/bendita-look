import { NewsletterCampaignModel } from '@/models/newsletter-campaign';
import { NewsletterCampaignRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class NewsletterCampaignRepositoryImplementation extends BaseRepositoryImplementation<NewsletterCampaignModel> implements NewsletterCampaignRepository {

    protected entityName(): string {

        return 'NewsletterCampaigns';

    }


    protected mapResult(Rows: any[]): NewsletterCampaignModel[] {

        return NewsletterCampaignModel.mapModel(Rows);

    }

}
