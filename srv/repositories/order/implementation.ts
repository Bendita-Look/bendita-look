import cds from '@sap/cds';
import { OrderDelivery, OrderModel } from '@/models/order';
import { OrderStatus } from '@/constants/order-status';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { OrderRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class OrderRepositoryImplementation extends BaseRepositoryImplementation<OrderModel> implements OrderRepository {

    public async findWithItemsById(Id: string): Promise<OrderModel | null> {

        return this.findOneWithItems({ ID: Id });

    }


    public async findWithItemsByAccess(Number: number, AccessCode: string): Promise<OrderModel | null> {

        return this.findOneWithItems({ Number, AccessCode });

    }


    public async findWithItemsByPeriod(Start: Date, End: Date): Promise<OrderModel[]> {

        const aOrders = await cds.run(
            SELECT.from(this.getEntity()).where({
                createdAt: { '>=': Start.toISOString(), '<': End.toISOString() }
            })
        );

        if (!aOrders.length) {
            return [];
        }

        const aItems = await cds.run(
            SELECT.from(ServiceLocator.getEntity('OrderItems')).where({ Order_ID: { in: aOrders.map((oOrder: { ID: string }) => oOrder.ID) } })
        );

        return this.mapResult(aOrders.map((oOrder: { ID: string }) => ({
            ...oOrder,
            Items: aItems.filter((oItem: { Order_ID: string }) => oItem.Order_ID === oOrder.ID)
        })));

    }


    public async findNextNumber(): Promise<number> {

        const oResult = await cds.run(
            SELECT.one.from(this.getEntity()).columns('max(Number) as lastNumber')
        );

        return Number(oResult?.lastNumber ?? 0) + 1;

    }


    public async createEntry(Order: OrderModel): Promise<void> {

        await cds.run(
            INSERT.into(this.getEntity()).entries({
                ...Order.toEntityObject(),
                Items: Order.Items.map((Item) => Item.toEntityObject())
            })
        );

    }


    public async updateStatus(Id: string, Status: OrderStatus, Delivery?: OrderDelivery): Promise<void> {

        await cds.run(
            UPDATE(this.getEntity()).set({ ...Delivery, Status }).where({ ID: Id })
        );

    }


    protected entityName(): string {

        return 'Orders';

    }


    protected mapResult(Rows: any[]): OrderModel[] {

        return OrderModel.mapModel(Rows);

    }


    private async findOneWithItems(Filter: Record<string, unknown>): Promise<OrderModel | null> {

        const oOrder = await cds.run(SELECT.one.from(this.getEntity()).where(Filter));

        if (!oOrder) {
            return null;
        }

        const aItems = await cds.run(
            SELECT.from(ServiceLocator.getEntity('OrderItems')).where({ Order_ID: oOrder.ID })
        );

        return this.mapResult([{ ...oOrder, Items: aItems }])[0];

    }

}
