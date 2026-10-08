import { OrderInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { ORDER_LIMITS } from '@/constants/order-limits';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = { min: 10, max: 13 };
const NAME_MIN_LENGTH = 3;

export type RequestedItem = {
    VariantId: string;
    Quantity: number;
};

export type ValidOrderInput = {
    CustomerName: string;
    CustomerEmail: string;
    CustomerPhone: string;
    Address?: string;
    District?: string;
    City?: string;
    ZipCode?: string;
    Notes?: string;
    Items: RequestedItem[];
};

export class OrderInputValidator {

    public validate(Input: OrderInput | null | undefined): Either<AbstractError, ValidOrderInput> {

        const sName = this.text(Input?.CustomerName);
        const sEmail = this.text(Input?.CustomerEmail)?.toLowerCase();
        const sPhone = (Input?.CustomerPhone ?? '').replace(/\D/g, '');

        if (!sName || sName.length < NAME_MIN_LENGTH) {
            return left(new ValidationError('error.customerNameRequired'));
        }

        if (!sEmail || !EMAIL_PATTERN.test(sEmail)) {
            return left(new ValidationError('error.invalidEmail'));
        }

        if (sPhone.length < PHONE_DIGITS.min || sPhone.length > PHONE_DIGITS.max) {
            return left(new ValidationError('error.invalidPhone'));
        }

        return this.validateItems(Input?.Items ?? []).map((Items) => ({
            CustomerName: sName,
            CustomerEmail: sEmail,
            CustomerPhone: sPhone,
            Address: this.text(Input?.Address),
            District: this.text(Input?.District),
            City: this.text(Input?.City),
            ZipCode: this.text(Input?.ZipCode),
            Notes: this.text(Input?.Notes),
            Items
        }));

    }


    private validateItems(Items: NonNullable<OrderInput['Items']>): Either<AbstractError, RequestedItem[]> {

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


    private text(value: string | null | undefined): string | undefined {

        const sValue = value?.trim();

        return sValue ? sValue : undefined;

    }

}
