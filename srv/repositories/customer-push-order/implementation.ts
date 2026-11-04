import cds from '@sap/cds';
import { CustomerPushOrderModel } from '@/models/customer-push-order';
import { CustomerPushOrderRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class CustomerPushOrderRepositoryImplementation extends BaseRepositoryImplementation<CustomerPushOrderModel> implements CustomerPushOrderRepository {

    public async replaceForDevice(DeviceId: string, OrderIds: string[]): Promise<void> {

        await cds.run(DELETE.from(this.getEntity()).where({ Device_ID: DeviceId }));

        if (!OrderIds.length) {
            return;
        }

        const aLinks = OrderIds.map((sOrderId) => CustomerPushOrderModel.with({
            Id: cds.utils.uuid(),
            DeviceId,
            OrderId: sOrderId
        }).toEntityObject());

        await cds.run(INSERT.into(this.getEntity()).entries(aLinks));

    }


    public async removeByOrder(OrderId: string): Promise<void> {

        await cds.run(DELETE.from(this.getEntity()).where({ Order_ID: OrderId }));

    }


    protected entityName(): string {

        return 'CustomerPushOrders';

    }


    protected mapResult(Rows: any[]): CustomerPushOrderModel[] {

        return CustomerPushOrderModel.mapModel(Rows);

    }

}
