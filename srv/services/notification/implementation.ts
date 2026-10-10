import Decimal from 'decimal.js';
import { OrderModel } from '@/models/order';
import { StoreSettingsModel } from '@/models/store-settings';
import { StoreSettingsService } from '@/services/store-settings';
import { EmailSender } from '@/infrastructure/EmailSender';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { Messages } from '@/infrastructure/Messages';
import { NotificationService } from './protocols';

const CURRENCY = 'BRL';
const DEFAULT_NUMBER_LOCALE = 'pt-BR';
const NUMBER_LOCALES: Record<string, string> = { en: 'en-US', pt: DEFAULT_NUMBER_LOCALE };
const BRAZIL_COUNTRY_CODE = '55';
const LOCAL_PHONE_MAX_DIGITS = 11;

export class NotificationServiceImplementation implements NotificationService {

    constructor(
        private readonly EmailSender: EmailSender,
        private readonly TemplateRenderer: TemplateRenderer,
        private readonly StoreSettingsService: StoreSettingsService
    ) { }


    public async sendOrderCreated(Order: OrderModel, Locale: string | undefined): Promise<void> {

        const oSettings = await this.StoreSettingsService.currentSettings();

        await this.EmailSender.send({
            fromName: oSettings.StoreName,
            to: Order.CustomerEmail,
            cc: oSettings.NotificationEmailList,
            subject: Messages.text('email.orderCreated.subject', Locale, { store: oSettings.StoreName, number: Order.Number }),
            html: this.renderOrder(Order, oSettings, Locale, Messages.text('email.orderCreated.message', Locale))
        });

    }


    public async sendOrderStatusChanged(Order: OrderModel, Locale: string | undefined): Promise<void> {

        const oSettings = await this.StoreSettingsService.currentSettings();

        await this.EmailSender.send({
            fromName: oSettings.StoreName,
            to: Order.CustomerEmail,
            subject: Messages.text('email.statusChanged.subject', Locale, {
                store: oSettings.StoreName,
                number: Order.Number,
                status: Messages.text(`orderStatus.${Order.Status}`, Locale)
            }),
            html: this.renderOrder(Order, oSettings, Locale, Messages.text(`email.statusChanged.message.${Order.Status}`, Locale))
        });

    }


    private renderOrder(Order: OrderModel, Settings: StoreSettingsModel, Locale: string | undefined, Message: string): string {

        const text = (key: string, args?: Record<string, string | number>) => Messages.text(`email.${key}`, Locale, args);

        return this.TemplateRenderer.render('order', {
            language: Locale || DEFAULT_NUMBER_LOCALE,
            texts: {
                title: Settings.StoreName,
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
                deliveryTitle: text('deliveryTitle'),
                deliveryType: text('deliveryType'),
                courierName: text('courierName'),
                vehiclePlate: text('vehiclePlate'),
                deliveryNotes: text('deliveryNotes'),
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
                total: this.formatCurrency(Order.TotalAmount, Locale)
            },
            delivery: Order.DeliveryType ? {
                type: Messages.text(`deliveryType.${Order.DeliveryType}`, Locale),
                courierName: Order.CourierName,
                vehiclePlate: Order.VehiclePlate,
                notes: Order.DeliveryNotes
            } : undefined,
            items: Order.Items.map((Item) => ({
                description: [Item.ProductName, Item.ColorName, Item.Size].filter(Boolean).join(' / '),
                quantity: Item.Quantity,
                unitPrice: this.formatCurrency(Item.UnitPrice, Locale),
                totalPrice: this.formatCurrency(Item.TotalPrice, Locale)
            })),
            trackingUrl: this.trackingUrl(Order),
            whatsappUrl: this.whatsappUrl(Settings.Whatsapp)
        });

    }


    private formatCurrency(Value: Decimal, Locale: string | undefined): string {

        const sNumberLocale = NUMBER_LOCALES[(Locale ?? '').slice(0, 2)] ?? DEFAULT_NUMBER_LOCALE;

        return new Intl.NumberFormat(sNumberLocale, { style: 'currency', currency: CURRENCY }).format(Value.toNumber());

    }


    private trackingUrl(Order: OrderModel): string | undefined {

        const sStoreUrl = process.env.STORE_URL;

        return sStoreUrl ? `${sStoreUrl}#/order/${Order.Number}/${Order.AccessCode}` : undefined;

    }


    private whatsappUrl(Phone: string | undefined): string | undefined {

        const sDigits = (Phone ?? '').replace(/\D/g, '');

        if (!sDigits) {
            return undefined;
        }

        return `https://wa.me/${sDigits.length <= LOCAL_PHONE_MAX_DIGITS ? BRAZIL_COUNTRY_CODE + sDigits : sDigits}`;

    }

}
