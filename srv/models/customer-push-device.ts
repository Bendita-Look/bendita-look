import { CustomerPushDevice, CustomerPushDevices } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type CustomerPushDeviceProperties = AuditProperties & {
    Id: string;
    Endpoint: string;
    P256dh: string;
    Auth: string;
    Locale?: string;
};

export class CustomerPushDeviceModel extends BaseModel {

    constructor(private readonly properties: CustomerPushDeviceProperties) { super(); }


    public static with(properties: CustomerPushDeviceProperties): CustomerPushDeviceModel {
        return new CustomerPushDeviceModel(properties);
    }


    public static mapModel(Devices: CustomerPushDevices): CustomerPushDeviceModel[] {

        return Devices.map((Device: CustomerPushDevice) => CustomerPushDeviceModel.with({
            Id: Device.ID as string,
            Endpoint: Device.Endpoint as string,
            P256dh: Device.P256dh as string,
            Auth: Device.Auth as string,
            Locale: Device.Locale ?? undefined,
            ...this.retrieveAudit(Device)
        }));

    }


    public get Id() { return this.properties.Id; }

    public get Endpoint() { return this.properties.Endpoint; }

    public get P256dh() { return this.properties.P256dh; }

    public get Auth() { return this.properties.Auth; }

    public get Locale() { return this.properties.Locale; }


    /** Formato aceito pelo web-push. */
    public toWebPushSubscription(): { endpoint: string; keys: { p256dh: string; auth: string } } {

        return {
            endpoint: this.properties.Endpoint,
            keys: {
                p256dh: this.properties.P256dh,
                auth: this.properties.Auth
            }
        };

    }


    public toEntityObject(): CustomerPushDevice {

        return this.cleanEntity({
            ID: this.properties.Id,
            Endpoint: this.properties.Endpoint,
            P256dh: this.properties.P256dh,
            Auth: this.properties.Auth,
            Locale: this.properties.Locale ?? null,
            ...this.auditEntityObject(this.properties)
        }) as CustomerPushDevice;

    }

}
