import cds from '@sap/cds';
import { OrderReturnModel } from '@/models/order-return';
import { OrderReturnRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class OrderReturnRepositoryImplementation extends BaseRepositoryImplementation<OrderReturnModel> implements OrderReturnRepository {

    public async findWithItemsByPeriod(Start: Date, End: Date): Promise<OrderReturnModel[]> {

        const aReturns = await cds.run(
            SELECT.from(this.getEntity(), (oReturn: any) => {
                oReturn('*');
                oReturn.Items((oItem: any) => { oItem('*'); oItem.Product((oProduct: any) => oProduct.Category((oCategory: any) => oCategory.Name)); });
            })
                .where`createdAt >= ${Start.toISOString()} and createdAt < ${End.toISOString()}`
        );

        return this.mapResult(aReturns);

    }


    public async createEntry(Return: OrderReturnModel): Promise<void> {

        await cds.run(
            INSERT.into(this.getEntity()).entries({
                ...Return.toEntityObject(),
                Items: Return.Items.map((Item) => Item.toEntityObject())
            })
        );

    }


    protected entityName(): string {

        return 'OrderReturns';

    }


    protected mapResult(Rows: any[]): OrderReturnModel[] {

        return OrderReturnModel.mapModel(Rows);

    }

}
