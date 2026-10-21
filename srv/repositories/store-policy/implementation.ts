import cds from '@sap/cds';
import { StorePolicyModel } from '@/models/store-policy';
import { StorePolicyRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class StorePolicyRepositoryImplementation extends BaseRepositoryImplementation<StorePolicyModel> implements StorePolicyRepository {

    public async findActive(): Promise<StorePolicyModel[]> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity())
                .where({ Active: true })
                .orderBy('SortOrder', 'Title')
        );

        return this.mapResult(oRows);

    }


    protected entityName(): string {

        return 'StorePolicies';

    }


    protected mapResult(Rows: any[]): StorePolicyModel[] {

        return StorePolicyModel.mapModel(Rows);

    }

}
