import { ProductMeasurement, ProductMeasurements } from '@models/apps/dflc/benditalook/entities';
import { BaseModel } from './base';

export type ProductMeasurementProperties = {
    Id: string;
    ProductId: string;
    Size: string;
    Label: string;
    Value?: string;
    SortOrder: number;
};

export class ProductMeasurementModel extends BaseModel {

    constructor(private readonly properties: ProductMeasurementProperties) { super(); }

    public static with(properties: ProductMeasurementProperties): ProductMeasurementModel {
        return new ProductMeasurementModel(properties);
    }

    public static mapModel(Measurements: ProductMeasurements): ProductMeasurementModel[] {

        return Measurements.map((Measurement: ProductMeasurement) => ProductMeasurementModel.with({
            Id: Measurement.ID as string,
            ProductId: Measurement.Product_ID as string,
            Size: Measurement.Size as string,
            Label: Measurement.Label as string,
            Value: Measurement.Value ?? undefined,
            SortOrder: Measurement.SortOrder ?? 0
        }));

    }

    public get Id() { return this.properties.Id; }

    public get ProductId() { return this.properties.ProductId; }

    public get Size() { return this.properties.Size; }

    public get Label() { return this.properties.Label; }

    public get Value() { return this.properties.Value; }

    public get SortOrder() { return this.properties.SortOrder; }

    public toEntityObject(): ProductMeasurement {

        return this.cleanEntity({
            ID: this.properties.Id,
            Product_ID: this.properties.ProductId,
            Size: this.properties.Size,
            Label: this.properties.Label,
            Value: this.properties.Value,
            SortOrder: this.properties.SortOrder
        });

    }

}
