import cds from '@sap/cds';
import nodemailer, { Transporter } from 'nodemailer';

export type EmailMessage = {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
};

export class EmailSender {

    private transporter?: Transporter;


    public isConfigured(): boolean {

        return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

    }


    public async send(Message: EmailMessage): Promise<void> {

        if (!this.isConfigured()) {

            cds.log('email').warn('SMTP is not configured, email skipped:', Message.subject);

            return;

        }

        await this.getTransporter().sendMail({
            from: `"${process.env.STORE_NAME || 'Bendita Look'}" <${process.env.SMTP_USER}>`,
            to: Message.to,
            cc: Message.cc?.length ? Message.cc : undefined,
            subject: Message.subject,
            html: Message.html
        });

    }


    private getTransporter(): Transporter {

        if (!this.transporter) {

            const iPort = Number(process.env.SMTP_PORT || 587);

            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: iPort,
                secure: iPort === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            });

        }

        return this.transporter;

    }

}
