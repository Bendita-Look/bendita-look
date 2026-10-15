import Decimal from 'decimal.js';
import { StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ValidationError } from '@/errors';

const NOTE_MAX_LENGTH = 255;
const MAX_ITEMS = 100;
const MAX_QUANTITY = 999;
const MAX_UNIT_COST = 1000000;

export type RequestedStockItem = {
    VariantId: string;
    Quantity: number;
    UnitCost: Decimal;
};

export type ValidStockEntry = {
    Note?: string;
    Items: RequestedStockItem[];
};

export class StockEntryValidator {

    public validate(Input: StockEntryInput | null | undefined): Either<AbstractError, ValidStockEntry> {

        const aItems = Input?.Items ?? [];
        const sNote = Input?.Note?.trim() || undefined;

        if (!aItems.length) {
            return left(new ValidationError('error.stockEntryItemsRequired'));
        }

        if (aItems.length > MAX_ITEMS) {
            return left(new ValidationError('error.tooManyItems', { max: MAX_ITEMS }));
        }

        if (sNote && sNote.length > NOTE_MAX_LENGTH) {
            return left(new ValidationError('error.stockEntryNoteTooLong', { max: NOTE_MAX_LENGTH }));
        }

        const oSeen = new Set<string>();
        const aValid: RequestedStockItem[] = [];

        for (const oItem of aItems) {

            const iQuantity = Number(oItem.Quantity);
            const nUnitCost = Number(oItem.UnitCost ?? 0);
            const bValid = Boolean(oItem.Variant_ID)
                && !oSeen.has(oItem.Variant_ID as string)
                && Number.isInteger(iQuantity) && iQuantity >= 1 && iQuantity <= MAX_QUANTITY
                && Number.isFinite(nUnitCost) && nUnitCost >= 0 && nUnitCost <= MAX_UNIT_COST;

            if (!bValid) {
                return left(new ValidationError('error.invalidStockEntryItem', { max: MAX_QUANTITY }));
            }

            oSeen.add(oItem.Variant_ID as string);
            aValid.push({ VariantId: oItem.Variant_ID as string, Quantity: iQuantity, UnitCost: new Decimal(nUnitCost).toDecimalPlaces(2) });

        }

        return right({ Note: sNote, Items: aValid });

    }

}
