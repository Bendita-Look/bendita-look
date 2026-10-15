import cds from '@sap/cds';
import { createHash } from 'crypto';
import nodemailer, { Transporter } from 'nodemailer';
import { HtmlText } from './HtmlText';

export type EmailAttachment = {
    filename: string;
    cid: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
};

export type EmailMessage = {
    fromName: string;
    to: string | string[];
    cc?: string[];
    replyTo?: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
};

export type EmailServerConfig = {
    Host: string;
    Port: number;
    Username: string;
    Sender?: string;
    Password: string;
};

export interface EmailServerProvider {
    activeServer(): Promise<EmailServerConfig | null>;
}

export class EmailSender {

    private transporter?: Transporter;

    private transporterKey?: string;

    constructor(private readonly Provider: EmailServerProvider) { }


    public async send(Message: EmailMessage): Promise<void> {

        const oServer = await this.Provider.activeServer();

        if (!oServer) {

            cds.log('email').warn('SMTP is not configured, email skipped:', Message.subject);

            return;

        }

        await this.sendWith(oServer, Message);

    }


    public async sendWith(Server: EmailServerConfig, Message: EmailMessage): Promise<void> {

        await this.getTransporter(Server).sendMail({
            from: `"${Message.fromName}" <${Server.Sender || Server.Username}>`,
            to: Message.to,
            cc: Message.cc?.length ? Message.cc : undefined,
            replyTo: Message.replyTo || undefined,
            subject: Message.subject,
            html: Message.html,
            text: HtmlText.from(Message.html),
            attachments: Message.attachments
        });

    }


    private getTransporter(Server: EmailServerConfig): Transporter {

        const sKey = createHash('sha256').update(JSON.stringify(Server)).digest('hex');

        if (!this.transporter || this.transporterKey !== sKey) {

            this.transporter?.close();

            this.transporter = nodemailer.createTransport({
                host: Server.Host,
                port: Server.Port,
                secure: Server.Port === 465,
                auth: {
                    user: Server.Username,
                    pass: Server.Password
                }
            });

            this.transporterKey = sKey;

        }

        return this.transporter;

    }

}
