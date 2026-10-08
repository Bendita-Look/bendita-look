import { ProductVariant, ProductVariants } from '@models/apps/dflc/benditalook/entities';
import { BaseModel } from './base';

export type ProductVariantProperties = {
    Id: string;
    ProductId: string;
    ColorId?: string;
    Size: string;
    Stock: number;
};

export class ProductVariantModel extends BaseModel {

    constructor(private readonly properties: ProductVariantProperties) { super(); }

    public static with(properties: ProductVariantProperties): ProductVariantModel {
        return new ProductVariantModel(properties);
    }

    public static mapModel(Variants: ProductVariants): ProductVariantModel[] {

        return Variants.map((Variant: ProductVariant) => ProductVariantModel.with({
            Id: Variant.ID as string,
            ProductId: Variant.Product_ID as string,
            ColorId: Variant.Color_ID ?? undefined,
            Size: Variant.Size as string,
            Stock: Variant.Stock ?? 0
        }));

    }

    public get Id() { return this.properties.Id; }

    public get ProductId() { return this.properties.ProductId; }

    public get ColorId() { return this.properties.ColorId; }

    public get Size() { return this.properties.Size; }

    public get Stock() { return this.properties.Stock; }

    public toEntityObject(): ProductVariant {

        return this.cleanEntity({
            ID: this.properties.Id,
            Product_ID: this.properties.ProductId,
            Color_ID: this.properties.ColorId,
            Size: this.properties.Size,
            Stock: this.properties.Stock
        });

    }

}
