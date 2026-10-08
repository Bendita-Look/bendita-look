import { User } from '@sap/cds';
import { Product, ProductColor, ProductImage, ProductVariant } from '@models/apps/dflc/benditalook/entities';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ConflictError, ValidationError } from '@/errors';
import { ProductRepository } from '@/repositories/product';
import { ProductVariantRepository } from '@/repositories/product-variant';
import { ProductService } from './protocols';
import { BaseServiceImplementation } from '../base/implementation';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export class ProductServiceImplementation extends BaseServiceImplementation<Product> implements ProductService {

    constructor(
        public readonly Repository: ProductRepository,
        private readonly VariantRepository: ProductVariantRepository
    ) {

        super();

    }


    public async beforeCreate(Product: Product, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return this.validate(Product);

    }


    public async beforeUpdate(Product: Product, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        const oValidation = await this.validate(Product);

        if (oValidation.isLeft()) {
            return oValidation;
        }

        return this.execute(() => this.applyConcurrentStockChanges(Product.Variants ?? []));

    }


    public async afterEdit(ProductId: string): Promise<Either<AbstractError, boolean>> {

        return this.execute(async () => {

            await this.VariantRepository.snapshotDraftStock(ProductId);

            return right(true);

        });

    }


    private async validate(Product: Product): Promise<Either<AbstractError, boolean>> {

        if ('Name' in Product && this.isBlank(Product.Name)) {
            return left(new ValidationError('error.productNameRequired'));
        }

        if ('Price' in Product && !(Number(Product.Price) > 0)) {
            return left(new ValidationError('error.invalidPrice'));
        }

        const aColors = Product.Colors ?? [];
        const aVariants = Product.Variants ?? [];

        if (Product.Active !== false && 'Variants' in Product && aVariants.length === 0) {
            return left(new ValidationError('error.productWithoutVariants'));
        }

        return this.validateColors(aColors)
            .chain(() => this.validateVariants(aVariants, aColors))
            .chain(() => this.validateImages(Product.Images ?? []));

    }


    private validateColors(Colors: ProductColor[]): Either<AbstractError, boolean> {

        const oNames = new Set<string>();

        for (const oColor of Colors) {

            if (this.isBlank(oColor.Name)) {
                return left(new ValidationError('error.colorNameRequired'));
            }

            const sName = (oColor.Name as string).trim().toLowerCase();

            if (oNames.has(sName)) {
                return left(new ValidationError('error.duplicatedColor', { color: oColor.Name as string }));
            }

            if (oColor.HexCode && !HEX_COLOR_PATTERN.test(oColor.HexCode)) {
                return left(new ValidationError('error.invalidHexCode', { color: oColor.Name as string }));
            }

            oNames.add(sName);

        }

        return right(true);

    }


    private validateVariants(Variants: ProductVariant[], Colors: ProductColor[]): Either<AbstractError, boolean> {

        const oColorIds = new Set(Colors.map((oColor) => oColor.ID));
        const oCombinations = new Set<string>();

        for (const oVariant of Variants) {

            if (this.isBlank(oVariant.Size)) {
                return left(new ValidationError('error.variantSizeRequired'));
            }

            const sSize = (oVariant.Size as string).trim();

            if (!Number.isInteger(oVariant.Stock ?? 0) || (oVariant.Stock ?? 0) < 0) {
                return left(new ValidationError('error.invalidStock', { size: sSize }));
            }

            if (oVariant.Color_ID && !oColorIds.has(oVariant.Color_ID)) {
                return left(new ValidationError('error.invalidVariantColor', { size: sSize }));
            }

            const sCombination = `${oVariant.Color_ID ?? ''}|${sSize.toUpperCase()}`;

            if (oCombinations.has(sCombination)) {
                return left(new ValidationError('error.duplicatedVariant', { size: sSize }));
            }

            oCombinations.add(sCombination);

        }

        return right(true);

    }


    private validateImages(Images: ProductImage[]): Either<AbstractError, boolean> {

        const bInvalidImage = Images.some((oImage) => oImage.ImageType && !oImage.ImageType.startsWith('image/'));

        if (bInvalidImage) {
            return left(new ValidationError('error.invalidImageType'));
        }

        return right(true);

    }


    private async applyConcurrentStockChanges(Variants: ProductVariant[]): Promise<Either<AbstractError, boolean>> {

        const aEditedVariants = Variants.filter((oVariant) => oVariant.StockOnEdit !== null && oVariant.StockOnEdit !== undefined);

        const aCurrentVariants = await this.VariantRepository.findByIds(aEditedVariants.map((oVariant) => oVariant.ID as string));

        const oCurrentStock = new Map(aCurrentVariants.map((oVariant) => [oVariant.Id, oVariant.Stock]));

        for (const oVariant of aEditedVariants) {

            const iCurrentStock = oCurrentStock.get(oVariant.ID as string) ?? (oVariant.StockOnEdit as number);
            const iNewStock = iCurrentStock + ((oVariant.Stock ?? 0) - (oVariant.StockOnEdit as number));

            if (iNewStock < 0) {
                return left(new ConflictError('error.stockChangedConcurrently', { size: oVariant.Size as string, stock: iCurrentStock }));
            }

            oVariant.Stock = iNewStock;

        }

        Variants.forEach((oVariant) => { oVariant.StockOnEdit = null; });

        return right(true);

    }

}
