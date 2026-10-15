import Decimal from 'decimal.js';
import { ActionResult, StockEntry, StockEntryInput } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, NotFoundError } from '@/errors';
import { OrderableVariantModel } from '@/models/orderable-variant';
import { StockEntryModel } from '@/models/stock-entry';
import { StockEntryItemModel } from '@/models/stock-entry-item';
import { ProductRepository } from '@/repositories/product';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { StockEntryRepository } from '@/repositories/stock-entry';
import { RequestedStockItem, StockEntryValidator, ValidStockEntry } from './stock-entry-validator';
import { StockEntryService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

type ProductAddition = {
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


    private async updateAverageCosts(Items: RequestedStockItem[], Variants: Map<string, OrderableVariantModel>): Promise<void> {

        const oAdditions = new Map<string, ProductAddition>();

        Items.forEach((oItem) => {

            const oVariant = Variants.get(oItem.VariantId) as OrderableVariantModel;
            const oCurrent = oAdditions.get(oVariant.ProductId) ?? { current: oVariant, quantity: 0, cost: new Decimal(0) };

            oAdditions.set(oVariant.ProductId, {
                current: oCurrent.current,
                quantity: oCurrent.quantity + oItem.Quantity,
                cost: oCurrent.cost.plus(oItem.UnitCost.times(oItem.Quantity))
            });

        });

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
