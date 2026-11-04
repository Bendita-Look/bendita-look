import Decimal from 'decimal.js';
import { ActionResult, StockEntry, StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, NotFoundError, ValidationError } from '@/errors';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { StockEntryModel } from '@/models/stock-entry';
import { StockEntryItemModel } from '@/models/stock-entry-item';
import { ProductRepository } from '@/repositories/product';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { StockEntryRepository } from '@/repositories/stock-entry';
import { Messages } from '@/infrastructure/Messages';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';
import { RequestedStockItem, StockEntryValidator, ValidStockEntry } from './stock-entry-validator';
import { StockEntryService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type CostedItem = Pick<RequestedStockItem, 'VariantId' | 'Quantity' | 'UnitCost'>;

type ProductMovement = {
    current: OrderableVariantModel;
    quantity: number;
    cost: Decimal;
};

export class StockEntryServiceImplementation extends BaseServiceImplementation<StockEntry> implements StockEntryService {

    constructor(
        public readonly Repository: StockEntryRepository,
        private readonly VariantRepository: ProductVariantRepository,
        private readonly ProductRepository: ProductRepository,
        private readonly Validator: StockEntryValidator = new StockEntryValidator()
    ) {

        super();

    }


    public async registerEntry(Input: StockEntryInput): Promise<Either<AbstractError, ActionResult>> {

        const oValidation = this.Validator.validate(Input);

        if (oValidation.isLeft()) {
            return left(oValidation.value);
        }

        return this.execute(async () => {

            const oEntry = oValidation.value;
            const aVariants = await this.VariantRepository.findOrderableByIds(oEntry.Items.map((oItem) => oItem.VariantId));
            const oVariants = new Map(aVariants.map((oVariant) => [oVariant.Id, oVariant]));

            if (oEntry.Items.some((oItem) => !oVariants.has(oItem.VariantId))) {
                return left(new NotFoundError('error.stockEntryVariantNotFound'));
            }

            await this.updateAverageCosts(oEntry.Items, oVariants);

            for (const oItem of oEntry.Items) {
                await this.VariantRepository.increaseStock(oItem.VariantId, oItem.Quantity);
            }

            const oModel = this.buildEntry(oEntry, oVariants);

            await this.Repository.createEntry(oModel);

            return right({ success: true, data: oModel.Id });

        });

    }


    public async deleteEntry(EntryId: string): Promise<Either<AbstractError, ActionResult>> {

        if (this.isBlank(EntryId)) {
            return left(new ValidationError('error.stockEntryNotFound'));
        }

        return this.execute(async () => {

            const oEntry = await this.Repository.findWithItemsById(EntryId);

            if (!oEntry) {
                return left(new NotFoundError('error.stockEntryNotFound'));
            }

            const oVariants = await this.findVariantsOf(oEntry.Items);
            const aItems = oEntry.Items.filter((oItem) => oVariants.has(oItem.VariantId));
            const oQuantities = this.sumQuantitiesByVariant(aItems);
            const oStock = this.validateStock(oQuantities, oVariants);

            if (oStock.isLeft()) {
                return left(oStock.value);
            }

            await this.revertAverageCosts(aItems, oVariants);

            const oRemoval = await this.removeStock(oQuantities, oVariants);

            if (oRemoval.isLeft()) {
                return left(oRemoval.value);
            }

            await this.Repository.deleteCascade(oEntry.Id);

            const iQuantity = aItems.reduce((iTotal, oItem) => iTotal + oItem.Quantity, 0);

            return right({ success: true, data: Messages.text('stockEntry.deleted', ServiceLocator.getLocale(), { quantity: iQuantity }) });

        });

    }


    private async updateAverageCosts(Items: RequestedStockItem[], Variants: Map<string, OrderableVariantModel>): Promise<void> {

        const oAdditions = this.groupByProduct(Items, Variants);
        const oStocks = await this.VariantRepository.sumStockByProducts([...oAdditions.keys()]);

        for (const [sProductId, oAddition] of oAdditions) {

            const iStock = oStocks.get(sProductId) ?? 0;
            const oAverage = oAddition.current.CostPrice
                .times(iStock)
                .plus(oAddition.cost)
                .dividedBy(iStock + oAddition.quantity)
                .toDecimalPlaces(2);

            await this.ProductRepository.updateCostPrice(sProductId, oAverage);

        }

    }


    private async revertAverageCosts(Items: CostedItem[], Variants: Map<string, OrderableVariantModel>): Promise<void> {

        const oRemovals = this.groupByProduct(Items, Variants);
        const oStocks = await this.VariantRepository.sumStockByProducts([...oRemovals.keys()]);

        for (const [sProductId, oRemoval] of oRemovals) {

            const iStock = oStocks.get(sProductId) ?? 0;
            const iRemaining = iStock - oRemoval.quantity;

            if (iRemaining <= 0) {
                continue;
            }

            const oAverage = oRemoval.current.CostPrice
                .times(iStock)
                .minus(oRemoval.cost)
                .dividedBy(iRemaining)
                .toDecimalPlaces(2);

            // O custo médio gravado é arredondado; desfazer a média pode dar centavos negativos.
            await this.ProductRepository.updateCostPrice(sProductId, Decimal.max(oAverage, 0));

        }

    }


    private groupByProduct(Items: CostedItem[], Variants: Map<string, OrderableVariantModel>): Map<string, ProductMovement> {

        const oMovements = new Map<string, ProductMovement>();

        Items.forEach((oItem) => {

            const oVariant = Variants.get(oItem.VariantId) as OrderableVariantModel;
            const oCurrent = oMovements.get(oVariant.ProductId) ?? { current: oVariant, quantity: 0, cost: new Decimal(0) };

            oMovements.set(oVariant.ProductId, {
                current: oCurrent.current,
                quantity: oCurrent.quantity + oItem.Quantity,
                cost: oCurrent.cost.plus(oItem.UnitCost.times(oItem.Quantity))
            });

        });

        return oMovements;

    }


    private async findVariantsOf(Items: StockEntryItemModel[]): Promise<Map<string, OrderableVariantModel>> {

        const aVariants = await this.VariantRepository.findOrderableByIds(Items.map((oItem) => oItem.VariantId).filter(Boolean));

        return new Map(aVariants.map((oVariant) => [oVariant.Id, oVariant]));

    }


    private sumQuantitiesByVariant(Items: StockEntryItemModel[]): Map<string, number> {

        const oQuantities = new Map<string, number>();

        Items.forEach((oItem) => oQuantities.set(oItem.VariantId, (oQuantities.get(oItem.VariantId) ?? 0) + oItem.Quantity));

        return oQuantities;

    }


    private validateStock(Quantities: Map<string, number>, Variants: Map<string, OrderableVariantModel>): Either<AbstractError, boolean> {

        for (const [sVariantId, iQuantity] of Quantities) {

            const oVariant = Variants.get(sVariantId) as OrderableVariantModel;

            if (oVariant.Stock < iQuantity) {
                return left(this.negativeStockError(oVariant, iQuantity));
            }

        }

        return right(true);

    }


    private async removeStock(Quantities: Map<string, number>, Variants: Map<string, OrderableVariantModel>): Promise<Either<AbstractError, boolean>> {

        for (const [sVariantId, iQuantity] of Quantities) {

            if (!await this.VariantRepository.decreaseStock(sVariantId, iQuantity)) {
                return left(this.negativeStockError(Variants.get(sVariantId) as OrderableVariantModel, iQuantity));
            }

        }

        return right(true);

    }


    private negativeStockError(Variant: OrderableVariantModel, Quantity: number): ConflictError {

        return new ConflictError('error.stockEntryWouldGoNegative', {
            product: Variant.Description,
            stock: Variant.Stock,
            quantity: Quantity
        });

    }


    private buildEntry(Entry: ValidStockEntry, Variants: Map<string, OrderableVariantModel>): StockEntryModel {

        const sEntryId = this.generateUUID();

        const aItems = Entry.Items.map((oItem) => {

            const oVariant = Variants.get(oItem.VariantId) as OrderableVariantModel;

            return StockEntryItemModel.with({
                Id: this.generateUUID(),
                EntryId: sEntryId,
                VariantId: oVariant.Id,
                ProductId: oVariant.ProductId,
                ProductName: oVariant.ProductName,
                ColorName: oVariant.ColorName,
                Size: oVariant.Size,
                Quantity: oItem.Quantity,
                UnitCost: oItem.UnitCost,
                TotalCost: oItem.UnitCost.times(oItem.Quantity).toDecimalPlaces(2)
            });

        });

        return StockEntryModel.with({
            Id: sEntryId,
            Note: Entry.Note,
            TotalQuantity: aItems.reduce((iTotal, oItem) => iTotal + oItem.Quantity, 0),
            TotalCost: aItems.reduce((oTotal, oItem) => oTotal.plus(oItem.TotalCost), new Decimal(0)),
            Items: aItems,
            CreatedAt: new Date().toISOString()
        });

    }

}
