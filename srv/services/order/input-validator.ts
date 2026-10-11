import { OrderInput, OrderItemInput, StoreSaleInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { ORDER_LIMITS } from '@/constants/order-limits';
import { FulfillmentType } from '@/constants/order-status';
import { OrderAddress } from '@/models/order';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = { min: 10, max: 13 };
const NAME_MIN_LENGTH = 3;
const ZIP_CODE_DIGITS = 8;
const STATE_PATTERN = /^[A-Z]{2}$/;
const COUPON_PATTERN = /^[A-Z0-9_-]{3,20}$/;

export type RequestedItem = {
    VariantId: string;
    Quantity: number;
};

export type ValidOrderInput = OrderAddress & {
    CustomerName: string;
    CustomerEmail: string;
    CustomerPhone: string;
    FulfillmentType: FulfillmentType;
    Notes?: string;
    CouponCode?: string;
    Items: RequestedItem[];
};

export type ValidStoreSaleInput = {
    CustomerName?: string;
    CustomerEmail?: string;
    CustomerPhone?: string;
    Notes?: string;
    CouponCode?: string;
    Items: RequestedItem[];
};

export class OrderInputValidator {

    public validate(Input: OrderInput | null | undefined): Either<AbstractError, ValidOrderInput> {

        const sName = this.text(Input?.CustomerName);
        const sEmail = this.text(Input?.CustomerEmail)?.toLowerCase();
        const sPhone = this.digits(Input?.CustomerPhone);

        if (!sName || sName.length < NAME_MIN_LENGTH) {
            return left(new ValidationError('error.customerNameRequired'));
        }

        if (!sEmail || !EMAIL_PATTERN.test(sEmail)) {
            return left(new ValidationError('error.invalidEmail'));
        }

        if (!this.isValidPhone(sPhone)) {
            return left(new ValidationError('error.invalidPhone'));
        }

        const eFulfillment = Input?.FulfillmentType === FulfillmentType.Pickup ? FulfillmentType.Pickup : FulfillmentType.Delivery;

        return this.validateAddress(Input, eFulfillment)
            .chain((Address) => this.normalizeCoupon(Input?.CouponCode).map((CouponCode) => ({ Address, CouponCode })))
            .chain(({ Address, CouponCode }) => this.validateItems(Input?.Items ?? []).map((Items) => ({
                ...Address,
                CustomerName: sName,
                CustomerEmail: sEmail,
                CustomerPhone: sPhone,
                FulfillmentType: eFulfillment,
                Notes: this.text(Input?.Notes),
                CouponCode,
                Items
            })));

    }


    public validateStoreSale(Input: StoreSaleInput | null | undefined): Either<AbstractError, ValidStoreSaleInput> {

        const sEmail = this.text(Input?.CustomerEmail)?.toLowerCase();
        const sPhone = this.digits(Input?.CustomerPhone);

        if (sEmail && !EMAIL_PATTERN.test(sEmail)) {
            return left(new ValidationError('error.invalidEmail'));
        }

        if (sPhone && !this.isValidPhone(sPhone)) {
            return left(new ValidationError('error.invalidPhone'));
        }

        return this.normalizeCoupon(Input?.CouponCode)
            .chain((CouponCode) => this.validateItems(Input?.Items ?? []).map((Items) => ({
                CustomerName: this.text(Input?.CustomerName),
                CustomerEmail: sEmail,
                CustomerPhone: sPhone || undefined,
                Notes: this.text(Input?.Notes),
                CouponCode,
                Items
            })));

    }


    public validateItems(Items: OrderItemInput[]): Either<AbstractError, RequestedItem[]> {

        if (!Items.length) {
            return left(new ValidationError('error.emptyCart'));
        }

        const oQuantities = new Map<string, number>();

        for (const oItem of Items) {

            const iQuantity = Number(oItem.Quantity);

            if (!oItem.Variant_ID || !Number.isInteger(iQuantity) || iQuantity < 1) {
                return left(new ValidationError('error.invalidCartItem'));
            }

            oQuantities.set(oItem.Variant_ID, (oQuantities.get(oItem.Variant_ID) ?? 0) + iQuantity);

        }

        if (oQuantities.size > ORDER_LIMITS.maxItems) {
            return left(new ValidationError('error.tooManyItems', { max: ORDER_LIMITS.maxItems }));
        }

        const bQuantityExceeded = [...oQuantities.values()].some((iQuantity) => iQuantity > ORDER_LIMITS.maxQuantityPerItem);

        if (bQuantityExceeded) {
            return left(new ValidationError('error.quantityExceeded', { max: ORDER_LIMITS.maxQuantityPerItem }));
        }

        return right([...oQuantities].map(([VariantId, Quantity]) => ({ VariantId, Quantity })));

    }


    public normalizeCoupon(CouponCode: string | null | undefined): Either<AbstractError, string | undefined> {

        const sCoupon = this.text(CouponCode)?.toUpperCase();

        if (sCoupon && !COUPON_PATTERN.test(sCoupon)) {
            return left(new ValidationError('error.invalidCouponCode'));
        }

        return right(sCoupon);

    }


    private validateAddress(Input: OrderInput | null | undefined, Fulfillment: FulfillmentType): Either<AbstractError, OrderAddress> {

        if (Fulfillment === FulfillmentType.Pickup) {
            return right({});
        }

        const oAddress: OrderAddress = {
            ZipCode: this.digits(Input?.ZipCode),
            Address: this.text(Input?.Address),
            AddressNumber: this.text(Input?.AddressNumber),
            Complement: this.text(Input?.Complement),
            District: this.text(Input?.District),
            City: this.text(Input?.City),
            State: this.text(Input?.State)?.toUpperCase()
        };

        if (oAddress.ZipCode?.length !== ZIP_CODE_DIGITS) {
            return left(new ValidationError('error.invalidZipCode'));
        }

        if (!oAddress.Address || !oAddress.District || !oAddress.City || !oAddress.State || !STATE_PATTERN.test(oAddress.State)) {
            return left(new ValidationError('error.addressIncomplete'));
        }

        if (!oAddress.AddressNumber) {
            return left(new ValidationError('error.addressNumberRequired'));
        }

        return right(oAddress);

    }


    private isValidPhone(Phone: string): boolean {

        return Phone.length >= PHONE_DIGITS.min && Phone.length <= PHONE_DIGITS.max;

    }


    private digits(value: string | null | undefined): string {

        return (value ?? '').replace(/\D/g, '');

    }


    private text(value: string | null | undefined): string | undefined {

        const sValue = value?.trim();

        return sValue ? sValue : undefined;

    }

}
