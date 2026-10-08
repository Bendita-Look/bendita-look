import { Product, Products } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { AuditProperties, BaseModel } from './base';

export type ProductProperties = AuditProperties & {
    Id: string;
    Name: string;
    Description?: string;
    Price: Decimal;
    Active: boolean;
    Featured: boolean;
    CategoryId: string;
};

export class ProductModel extends BaseModel {

    constructor(private readonly properties: ProductProperties) { super(); }

    public static with(properties: ProductProperties): ProductModel {
        return new ProductModel(properties);
    }

    public static mapModel(Products: Products): ProductModel[] {

        return Products.map((Product: Product) => ProductModel.with({
            Id: Product.ID as string,
            Name: Product.Name as string,
            Description: Product.Description ?? undefined,
            Price: this.retrieveDecimal(Product.Price),
            Active: Product.Active !== false,
            Featured: Product.Featured === true,
            CategoryId: Product.Category_ID as string,
            ...this.retrieveAudit(Product)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Name() { return this.properties.Name; }

    public get Price() { return this.properties.Price; }

    public get Active() { return this.properties.Active; }

    public toEntityObject(): Product {

        return this.cleanEntity({
            ID: this.properties.Id,
            Name: this.properties.Name,
            Description: this.properties.Description,
            Price: this.properties.Price.toNumber(),
            Active: this.properties.Active,
            Featured: this.properties.Featured,
            Category_ID: this.properties.CategoryId,
            ...this.auditEntityObject(this.properties)
        });

    }

}
