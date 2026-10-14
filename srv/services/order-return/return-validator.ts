import { ReturnInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';
import { OrderInputValidator, RequestedItem } from '@/services/order/input-validator';

const REASON_MAX_LENGTH = 255;

export type RequestedReturnItem = {
    OrderItemId: string;
    Quantity: number;
    Restock: boolean;
};

export type ValidReturnInput = {
    Reason?: string;
    Items: RequestedReturnItem[];
    Replacements: RequestedItem[];
};

export class OrderReturnValidator {

    constructor(private readonly ItemValidator: OrderInputValidator = new OrderInputValidator()) { }


    public validate(Input: ReturnInput | null | undefined): Either<AbstractError, ValidReturnInput> {

        const aItems = Input?.Items ?? [];
        const sReason = Input?.Reason?.trim() || undefined;

        if (!aItems.length) {
            return left(new ValidationError('error.returnItemsRequired'));
        }

        if (sReason && sReason.length > REASON_MAX_LENGTH) {
            return left(new ValidationError('error.returnReasonTooLong', { max: REASON_MAX_LENGTH }));
        }

        const oItems = this.validateItems(aItems);

        if (oItems.isLeft()) {
            return left(oItems.value);
        }

        const aReplacements = Input?.Replacements ?? [];
        const oReplacements = aReplacements.length ? this.ItemValidator.validateItems(aReplacements) : right([]);

        return oReplacements.map((Replacements) => ({ Reason: sReason, Items: oItems.value, Replacements }));

    }


    private validateItems(Items: NonNullable<ReturnInput['Items']>): Either<AbstractError, RequestedReturnItem[]> {

        const oSeen = new Set<string>();
        const aItems: RequestedReturnItem[] = [];

        for (const oItem of Items) {

            const iQuantity = Number(oItem.Quantity);

            if (!oItem.OrderItem_ID || oSeen.has(oItem.OrderItem_ID) || !Number.isInteger(iQuantity) || iQuantity < 1) {
                return left(new ValidationError('error.invalidReturnItem'));
            }

            oSeen.add(oItem.OrderItem_ID);
            aItems.push({ OrderItemId: oItem.OrderItem_ID, Quantity: iQuantity, Restock: oItem.Restock !== false });

        }

        return right(aItems);

    }

}
