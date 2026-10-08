import { ProductColor, ProductColors } from '@models/apps/dflc/benditalook/entities';
import { BaseModel } from './base';

export type ProductColorProperties = {
    Id: string;
    ProductId: string;
    Name: string;
    HexCode?: string;
};

export class ProductColorModel extends BaseModel {

    constructor(private readonly properties: ProductColorProperties) { super(); }

    public static with(properties: ProductColorProperties): ProductColorModel {
        return new ProductColorModel(properties);
    }

    public static mapModel(Colors: ProductColors): ProductColorModel[] {

        return Colors.map((Color: ProductColor) => ProductColorModel.with({
            Id: Color.ID as string,
            ProductId: Color.Product_ID as string,
            Name: Color.Name as string,
            HexCode: Color.HexCode ?? undefined
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Name() { return this.properties.Name; }

    public toEntityObject(): ProductColor {

        return this.cleanEntity({
            ID: this.properties.Id,
            Product_ID: this.properties.ProductId,
            Name: this.properties.Name,
            HexCode: this.properties.HexCode
        });

    }

}
