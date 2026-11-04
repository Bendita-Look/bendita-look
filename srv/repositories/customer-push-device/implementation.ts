import cds from '@sap/cds';
import { CustomerPushDeviceModel } from '@/models/customer-push-device';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { CustomerPushDeviceRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class CustomerPushDeviceRepositoryImplementation extends BaseRepositoryImplementation<CustomerPushDeviceModel> implements CustomerPushDeviceRepository {

    public async findByEndpoint(Endpoint: string): Promise<CustomerPushDeviceModel | null> {

        const oRows = await cds.run(
            SELECT.from(this.getEntity()).where({ Endpoint })
        );

        return this.mapResult(oRows)[0] ?? null;

    }


    public async findByOrder(OrderId: string): Promise<CustomerPushDeviceModel[]> {

        const oLinkedDeviceIds = SELECT.from(ServiceLocator.getEntity('CustomerPushOrders')).columns('Device_ID').where({ Order_ID: OrderId });
        const oRows = await cds.run(
            SELECT.from(this.getEntity()).where({ ID: { in: oLinkedDeviceIds } })
        );

        return this.mapResult(oRows);

    }


    public async removeByEndpoint(Endpoint: string): Promise<void> {

        const oDeviceIds = SELECT.from(this.getEntity()).columns('ID').where({ Endpoint });

        await cds.run(DELETE.from(ServiceLocator.getEntity('CustomerPushOrders')).where({ Device_ID: { in: oDeviceIds } }));
        await cds.run(DELETE.from(this.getEntity()).where({ Endpoint }));

    }


    public async removeOrphans(): Promise<void> {

        const oLinkedDeviceIds = SELECT.from(ServiceLocator.getEntity('CustomerPushOrders')).columns('Device_ID');

        await cds.run(DELETE.from(this.getEntity()).where({ ID: { 'not in': oLinkedDeviceIds } }));

    }


    protected entityName(): string {

        return 'CustomerPushDevices';

    }


    protected mapResult(Rows: any[]): CustomerPushDeviceModel[] {

        return CustomerPushDeviceModel.mapModel(Rows);

    }

}
