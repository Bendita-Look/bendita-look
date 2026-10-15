import cds from '@sap/cds';
import { EmailServerModel } from '@/models/email-server';
import { EMAIL_SERVER_ID } from '@/constants/store-settings';
import { EmailServerRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class EmailServerRepositoryImplementation extends BaseRepositoryImplementation<EmailServerModel> implements EmailServerRepository {

    public async findCurrent(): Promise<EmailServerModel | null> {

        return this.findById(EMAIL_SERVER_ID);

    }


    public async saveCurrent(Server: EmailServerModel): Promise<void> {

        await cds.run(UPSERT.into(this.getEntity()).entries(Server.toEntityObject()));

    }


    public async removeCurrent(): Promise<void> {

        await cds.run(DELETE.from(this.getEntity()).where({ ID: EMAIL_SERVER_ID }));

    }


    protected entityName(): string {

        return 'EmailServers';

    }


    protected mapResult(Rows: any[]): EmailServerModel[] {

        return EmailServerModel.mapModel(Rows);

    }

}
