import { CustomerPushOrder, CustomerPushOrders } from '@models/apps/dflc/benditalook/entities';
import { BaseModel } from './base';

export type CustomerPushOrderProperties = {
    Id: string;
    DeviceId: string;
    OrderId: string;
};

export class CustomerPushOrderModel extends BaseModel {

    constructor(private readonly properties: CustomerPushOrderProperties) { super(); }


    public static with(properties: CustomerPushOrderProperties): CustomerPushOrderModel {
        return new CustomerPushOrderModel(properties);
    }


    public static mapModel(Links: CustomerPushOrders): CustomerPushOrderModel[] {

        return Links.map((Link: CustomerPushOrder) => CustomerPushOrderModel.with({
            Id: Link.ID as string,
            DeviceId: Link.Device_ID as string,
            OrderId: Link.Order_ID as string
        }));

    }


    public get Id() { return this.properties.Id; }

    public get DeviceId() { return this.properties.DeviceId; }

    public get OrderId() { return this.properties.OrderId; }


    public toEntityObject(): CustomerPushOrder {

        return this.cleanEntity({
            ID: this.properties.Id,
            Device_ID: this.properties.DeviceId,
            Order_ID: this.properties.OrderId
        }) as CustomerPushOrder;

    }

}
