import Decimal from 'decimal.js';
import { OrderModel } from '@/models/order';
import { EmailSender } from '@/infrastructure/EmailSender';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { Messages } from '@/infrastructure/Messages';
import { NotificationService } from './protocols';

export class NotificationServiceImplementation implements NotificationService {

    private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    constructor(
        private readonly EmailSender: EmailSender,
        private readonly TemplateRenderer: TemplateRenderer
    ) { }


    public async sendOrderCreated(Order: OrderModel, Locale: string | undefined): Promise<void> {

        await this.EmailSender.send({
            to: Order.CustomerEmail,
            cc: this.adminEmails(),
            subject: Messages.text('email.orderCreated.subject', Locale, { number: Order.Number }),
            html: this.renderOrder(Order, Locale, Messages.text('email.orderCreated.message', Locale))
        });

    }


    public async sendOrderStatusChanged(Order: OrderModel, Locale: string | undefined): Promise<void> {

        await this.EmailSender.send({
            to: Order.CustomerEmail,
            subject: Messages.text('email.statusChanged.subject', Locale, {
                number: Order.Number,
                status: Messages.text(`orderStatus.${Order.Status}`, Locale)
            }),
            html: this.renderOrder(Order, Locale, Messages.text(`email.statusChanged.message.${Order.Status}`, Locale))
        });

    }


    private renderOrder(Order: OrderModel, Locale: string | undefined, Message: string): string {

        const text = (key: string, args?: Record<string, string | number>) => Messages.text(`email.${key}`, Locale, args);

        return this.TemplateRenderer.render('order', {
            texts: {
                title: text('title'),
                greeting: text('greeting', { name: Order.CustomerName }),
                message: Message,
                orderNumber: text('orderNumber', { number: Order.Number }),
                status: text('status'),
                itemsTitle: text('itemsTitle'),
                product: text('product'),
                quantity: text('quantity'),
                price: text('price'),
                total: text('total'),
                contactTitle: text('contactTitle'),
                trackOrder: text('trackOrder'),
                whatsapp: text('whatsapp'),
                footer: text('footer')
            },
            order: {
                statusLabel: Messages.text(`orderStatus.${Order.Status}`, Locale),
                customerName: Order.CustomerName,
                customerEmail: Order.CustomerEmail,
                customerPhone: Order.CustomerPhone,
                address: [Order.Address, Order.District, Order.City, Order.ZipCode].filter(Boolean).join(' - '),
                notes: Order.Notes,
                total: this.formatCurrency(Order.TotalAmount)
            },
            items: Order.Items.map((Item) => ({
                description: [Item.ProductName, Item.ColorName, Item.Size].filter(Boolean).join(' / '),
                quantity: Item.Quantity,
                unitPrice: this.formatCurrency(Item.UnitPrice),
                totalPrice: this.formatCurrency(Item.TotalPrice)
            })),
            trackingUrl: this.trackingUrl(Order),
            whatsappUrl: this.whatsappUrl()
        });

    }


    private formatCurrency(Value: Decimal): string {

        return this.currencyFormatter.format(Value.toNumber());

    }


    private adminEmails(): string[] {

        return (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((sEmail) => sEmail.trim())
            .filter(Boolean);

    }


    private trackingUrl(Order: OrderModel): string | undefined {

        const sStoreUrl = process.env.STORE_URL;

        return sStoreUrl ? `${sStoreUrl}#/order/${Order.Number}/${Order.AccessCode}` : undefined;

    }


    private whatsappUrl(): string | undefined {

        const sPhone = process.env.STORE_WHATSAPP;

        return sPhone ? `https://wa.me/${sPhone}` : undefined;

    }

}
