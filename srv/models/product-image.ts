import { ProductImage, ProductImages } from '@models/apps/dflc/benditalook/entities';
import { Readable } from 'stream';
import { BaseModel } from './base';

export type ProductImageProperties = {
    Id: string;
    ProductId: string;
    ColorId?: string;
    SortOrder: number;
    ImageType?: string;
    Image?: Readable;
};

export class ProductImageModel extends BaseModel {

    constructor(private readonly properties: ProductImageProperties) { super(); }

    public static with(properties: ProductImageProperties): ProductImageModel {
        return new ProductImageModel(properties);
    }

    public static mapModel(Images: ProductImages): ProductImageModel[] {

        return Images.map((Image: ProductImage) => ProductImageModel.with({
            Id: Image.ID as string,
            ProductId: Image.Product_ID as string,
            ColorId: Image.Color_ID ?? undefined,
            SortOrder: Image.SortOrder ?? 0,
            ImageType: Image.ImageType ?? undefined,
            Image: (Image.Image as unknown as Readable) ?? undefined
        }));

    }

    public get Id() { return this.properties.Id; }

    public get ProductId() { return this.properties.ProductId; }

    public get ColorId() { return this.properties.ColorId; }

    public get ImageType() { return this.properties.ImageType; }

    public get Image() { return this.properties.Image; }

    public get FileExtension() { return this.properties.ImageType?.split('/')[1]; }

    public toEntityObject(): ProductImage {

        return this.cleanEntity({
            ID: this.properties.Id,
            Product_ID: this.properties.ProductId,
            Color_ID: this.properties.ColorId,
            SortOrder: this.properties.SortOrder,
            ImageType: this.properties.ImageType
        });

    }

}
