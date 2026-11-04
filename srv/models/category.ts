import { Categories, Category } from '@models/apps/dflc/benditalook/entities';
import { Readable } from 'stream';
import { AuditProperties, BaseModel } from './base';

export type CategoryProperties = AuditProperties & {
    Id: string;
    Name: string;
    Description?: string;
    Active: boolean;
    ImageType?: string;
    Image?: Readable;
};

export class CategoryModel extends BaseModel {

    constructor(private readonly properties: CategoryProperties) { super(); }

    public static with(properties: CategoryProperties): CategoryModel {
        return new CategoryModel(properties);
    }

    public static mapModel(Categories: Categories): CategoryModel[] {

        return Categories.map((Category: Category) => CategoryModel.with({
            Id: Category.ID as string,
            Name: Category.Name as string,
            Description: Category.Description ?? undefined,
            Active: Category.Active !== false,
            ImageType: Category.CategoryImageType ?? undefined,
            Image: (Category.CategoryImage as unknown as Readable) ?? undefined,
            ...this.retrieveAudit(Category)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get Name() { return this.properties.Name; }

    public get Active() { return this.properties.Active; }

    public get ImageType() { return this.properties.ImageType; }

    public get Image() { return this.properties.Image; }

    public get FileExtension() { return this.properties.ImageType?.split('/')[1]; }

    public toEntityObject(): Category {

        return this.cleanEntity({
            ID: this.properties.Id,
            Name: this.properties.Name,
            Description: this.properties.Description,
            Active: this.properties.Active,
            CategoryImageType: this.properties.ImageType,
            ...this.auditEntityObject(this.properties)
        });

    }

}
