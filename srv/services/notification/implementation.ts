import path from 'path';
import Decimal from 'decimal.js';
import { PromotionReward } from '@/constants/promotions';
import { OrderModel } from '@/models/order';
import { StoreSettingsModel } from '@/models/store-settings';
import { StoreSettingsService } from '@/services/store-settings';
import { EmailAttachment, EmailSender } from '@/infrastructure/EmailSender';
import { TemplateRenderer } from '@/infrastructure/TemplateRenderer';
import { Messages } from '@/infrastructure/Messages';
import { NotificationService } from './protocols';

const CURRENCY = 'BRL';
const DEFAULT_NUMBER_LOCALE = 'pt-BR';
const NUMBER_LOCALES: Record<string, string> = { en: 'en-US', pt: DEFAULT_NUMBER_LOCALE };
const BRAZIL_COUNTRY_CODE = '55';
const LOCAL_PHONE_MAX_DIGITS = 11;
const TEMPLATE_NAME = 'order';
const LOGO_CID = 'logo';
const LOGO_FILE = 'logo.jpg';

type EmailKind = 'orderCreated' | 'statusChanged' | 'storeSale';

type EmailOptions = {
    kind: EmailKind;
    message: string;
    showStatus: boolean;
    showContact: boolean;
    primaryUrl?: string;
};

export class NotificationServiceImplementation implements NotificationService {

    constructor(
        private readonly EmailSender: EmailSender,
        private readonly TemplateRenderer: TemplateRenderer,
        private readonly StoreSettingsService: StoreSettingsService,
        private readonly TemplatesDirectory: string
    ) { }


    public async sendOrderCreated(Order: OrderModel, Locale: string | undefined): Promise<void> {

        const oSettings = await this.StoreSettingsService.currentSettings();

        await this.send(Order, oSettings, Locale, oSettings.NotificationEmailList, {
            kind: 'orderCreated',
            message: Messages.text(Order.IsPickup ? 'email.orderCreated.messagePickup' : 'email.orderCreated.message', Locale),
            showStatus: true,
            showContact: true,
            primaryUrl: this.trackingUrl(Order, oSettings)
        });

    }


    public async sendOrderStatusChanged(Order: OrderModel, Locale: string | undefined): Promise<void> {

        const oSettings = await this.StoreSettingsService.currentSettings();

        await this.send(Order, oSettings, Locale, [], {
            kind: 'statusChanged',
            message: Messages.text(`email.statusChanged.message.${Order.Status}`, Locale),
            showStatus: true,
            showContact: false,
            primaryUrl: this.trackingUrl(Order, oSettings)
        });

    }


    public async sendStoreSaleThanks(Order: OrderModel, Locale: string | undefined): Promise<void> {

        const oSettings = await this.StoreSettingsService.currentSettings();

        await this.send(Order, oSettings, Locale, [], {
            kind: 'storeSale',
            message: Messages.text('email.storeSale.message', Locale, { store: oSettings.StoreName }),
            showStatus: false,
            showContact: false,
            primaryUrl: oSettings.StoreUrl
        });

    }


    private async send(Order: OrderModel, Settings: StoreSettingsModel, Locale: string | undefined, Copies: string[], Options: EmailOptions): Promise<void> {

        if (!Order.CustomerEmail) {
            return;
        }

        await this.EmailSender.send({
            fromName: Settings.StoreName,
            to: Order.CustomerEmail,
            cc: Copies,
            subject: Messages.text(`email.${Options.kind}.subject`, Locale, {
                store: Settings.StoreName,
                number: Order.Number,
                status: Messages.text(`orderStatus.${Order.Status}`, Locale)
            }),
            html: this.render(Order, Settings, Locale, Options),
            attachments: [this.logoAttachment()]
        });

    }


    private render(Order: OrderModel, Settings: StoreSettingsModel, Locale: string | undefined, Options: EmailOptions): string {

        const text = (key: string, args?: Record<string, string | number>) => Messages.text(`email.${key}`, Locale, args);
        const currency = (value: Decimal) => this.formatCurrency(value, Locale);

        return this.TemplateRenderer.render(TEMPLATE_NAME, {
            language: Locale || DEFAULT_NUMBER_LOCALE,
            texts: {
                title: Settings.StoreName,
                greeting: Order.CustomerName ? text('greeting', { name: Order.CustomerName }) : text('greetingAnonymous'),
                message: Options.message,
                orderNumber: text('orderNumber', { number: Order.Number }),
                status: text('status'),
                itemsTitle: text('itemsTitle'),
                product: text('product'),
                quantity: text('quantity'),
                price: text('price'),
                subtotal: text('subtotal'),
                discount: text('discount'),
                total: text('total'),
                promotionsTitle: text('promotionsTitle'),
                pickupTitle: text('pickupTitle'),
                pickupMessage: text('pickupMessage'),
                contactTitle: text('contactTitle'),
                deliveryTitle: text('deliveryTitle'),
                deliveryType: text('deliveryType'),
                courierName: text('courierName'),
                vehiclePlate: text('vehiclePlate'),
                deliveryNotes: text('deliveryNotes'),
                primaryAction: text(Options.kind === 'storeSale' ? 'seeMoreItems' : 'trackOrder'),
                whatsapp: text('whatsapp'),
                footer: text('footer')
            },
            order: {
                statusLabel: Options.showStatus ? Messages.text(`orderStatus.${Order.Status}`, Locale) : undefined,
                hasDiscount: Order.DiscountAmount.greaterThan(0),
                subtotal: currency(Order.SubtotalAmount),
                discount: currency(Order.DiscountAmount),
                total: currency(Order.TotalAmount)
            },
            items: Order.Items.map((Item) => ({
                description: [Item.ProductName, Item.ColorName, Item.Size].filter(Boolean).join(' / '),
                quantity: Item.Quantity,
                unitPrice: currency(Item.UnitPrice),
                totalPrice: currency(Item.TotalPrice)
            })),
            promotions: Order.Promotions.map((Promotion) => ({
                name: Promotion.PromotionName,
                gift: Promotion.RewardType === PromotionReward.Gift ? Promotion.GiftDescription : undefined,
                discount: Promotion.DiscountAmount.greaterThan(0) ? currency(Promotion.DiscountAmount) : undefined
            })),
            pickup: Order.IsPickup && Options.kind !== 'storeSale' ? { address: Settings.PickupAddress } : undefined,
            delivery: Order.DeliveryType ? {
                type: Messages.text(`deliveryType.${Order.DeliveryType}`, Locale),
                courierName: Order.CourierName,
                vehiclePlate: Order.VehiclePlate,
                notes: Order.DeliveryNotes
            } : undefined,
            contact: Options.showContact ? {
                name: Order.CustomerName,
                phone: Order.CustomerPhone,
                email: Order.CustomerEmail,
                address: Order.IsPickup ? undefined : Order.FormattedAddress,
                notes: Order.Notes
            } : undefined,
            primaryUrl: Options.primaryUrl,
            whatsappUrl: this.whatsappUrl(Settings.Whatsapp)
        });

    }


    private logoAttachment(): EmailAttachment {

        return { filename: LOGO_FILE, path: path.join(this.TemplatesDirectory, LOGO_FILE), cid: LOGO_CID };

    }


    private formatCurrency(Value: Decimal, Locale: string | undefined): string {

        const sNumberLocale = NUMBER_LOCALES[(Locale ?? '').slice(0, 2)] ?? DEFAULT_NUMBER_LOCALE;

        return new Intl.NumberFormat(sNumberLocale, { style: 'currency', currency: CURRENCY }).format(Value.toNumber());

    }


    private trackingUrl(Order: OrderModel, Settings: StoreSettingsModel): string | undefined {

        const sStoreUrl = Settings.StoreUrl || process.env.STORE_URL;

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
