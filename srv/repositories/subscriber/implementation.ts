import cds from '@sap/cds';
import { SubscriberModel } from '@/models/subscriber';
import { SubscriberRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class SubscriberRepositoryImplementation extends BaseRepositoryImplementation<SubscriberModel> implements SubscriberRepository {

    public async findActive(): Promise<SubscriberModel[]> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .where({ Active: true })
                .orderBy('Email')
        );

        return this.mapResult(oRows);

    }


    public async findByEmail(Email: string): Promise<SubscriberModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .where({ Email: { like: Email } })
        );

        const oMatch = this.mapResult(oRows).find((Subscriber) => Subscriber.Email.toLowerCase() === Email.toLowerCase());

        return oMatch ?? null;

    }


    public async findByToken(Token: string): Promise<SubscriberModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity()).where({ Token })
        );

        return this.mapResult(oRows)[0] ?? null;

    }


    protected entityName(): string {

        return 'Subscribers';

    }


    protected mapResult(Rows: any[]): SubscriberModel[] {

        return SubscriberModel.mapModel(Rows);

    }

}
