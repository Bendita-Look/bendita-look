import { EmailServer, EmailServers } from '@models/apps/dflc/benditalook/entities';
import { AuditProperties, BaseModel } from './base';

export type EmailServerProperties = AuditProperties & {
    Id: string;
    Host: string;
    Port: number;
    Username: string;
    Sender?: string;
    Password: string;
};

export class EmailServerModel extends BaseModel {

    constructor(private readonly properties: EmailServerProperties) { super(); }

    public static with(properties: EmailServerProperties): EmailServerModel {
        return new EmailServerModel(properties);
    }

    public static mapModel(Servers: EmailServers): EmailServerModel[] {

        return Servers.map((Server: EmailServer) => EmailServerModel.with({
            Id: Server.ID as string,
            Host: Server.Host as string,
            Port: Server.Port as number,
            Username: Server.Username as string,
            Sender: Server.Sender ?? undefined,
            Password: Server.Password as string,
            ...this.retrieveAudit(Server)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Host() { return this.properties.Host; }

    public get Port() { return this.properties.Port; }

    public get Username() { return this.properties.Username; }

    public get Sender() { return this.properties.Sender; }

    public get Password() { return this.properties.Password; }

    public toEntityObject(): EmailServer {

        return {
            ID: this.properties.Id,
            Host: this.properties.Host,
            Port: this.properties.Port,
            Username: this.properties.Username,
            Sender: this.properties.Sender ?? null,
            Password: this.properties.Password
        };

    }

}
