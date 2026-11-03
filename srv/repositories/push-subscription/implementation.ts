import cds from '@sap/cds';
import { PushSubscriptionModel } from '@/models/push-subscription';
import { PushSubscriptionRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class PushSubscriptionRepositoryImplementation extends BaseRepositoryImplementation<PushSubscriptionModel> implements PushSubscriptionRepository {

    public async findActive(): Promise<PushSubscriptionModel[]> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity()).where({ Active: true })
        );

        return this.mapResult(oRows);

    }


    public async findByEndpoint(Endpoint: string): Promise<PushSubscriptionModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity()).where({ Endpoint })
        );

        return this.mapResult(oRows)[0] ?? null;

    }


    public async removeByEndpoint(Endpoint: string): Promise<void> {

        await cds.run(DELETE.from(this.getEntity()).where({ Endpoint }));

    }


    public async deactivate(Endpoint: string): Promise<void> {

        await cds.run(UPDATE(this.getEntity()).set({ Active: false }).where({ Endpoint }));

    }


    protected entityName(): string {

        return 'PushSubscriptions';

    }


    protected mapResult(Rows: any[]): PushSubscriptionModel[] {

        return PushSubscriptionModel.mapModel(Rows);

    }

}
