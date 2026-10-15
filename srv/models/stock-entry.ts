import { StockEntries, StockEntry } from '@models/apps/dflc/benditalook/entities';
import Decimal from 'decimal.js';
import { AuditProperties, BaseModel } from './base';
import { StockEntryItemModel } from './stock-entry-item';

export type StockEntryProperties = AuditProperties & {
    Id: string;
    Note?: string;
    TotalQuantity: number;
    TotalCost: Decimal;
    Items: StockEntryItemModel[];
};

export class StockEntryModel extends BaseModel {

    constructor(private readonly properties: StockEntryProperties) { super(); }

    public static with(properties: StockEntryProperties): StockEntryModel {
        return new StockEntryModel(properties);
    }

    public static mapModel(Entries: StockEntries): StockEntryModel[] {

        return Entries.map((Entry: StockEntry) => StockEntryModel.with({
            Id: Entry.ID as string,
            Note: Entry.Note ?? undefined,
            TotalQuantity: Entry.TotalQuantity ?? 0,
            TotalCost: this.retrieveDecimal(Entry.TotalCost),
            Items: StockEntryItemModel.mapModel(Entry.Items ?? []),
            ...this.retrieveAudit(Entry)
        }));

    }

    public get Id() { return this.properties.Id; }

    public get TotalCost() { return this.properties.TotalCost; }

    public get Items() { return this.properties.Items; }

    public get CreatedAt() { return this.properties.CreatedAt; }

    public toEntityObject(): StockEntry {

        return this.cleanEntity({
            ID: this.properties.Id,
            Note: this.properties.Note,
            TotalQuantity: this.properties.TotalQuantity,
            TotalCost: this.properties.TotalCost.toNumber(),
            ...this.auditEntityObject(this.properties)
        });

    }

}
