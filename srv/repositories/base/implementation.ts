import cds, { entity } from '@sap/cds';
import { BaseRepository } from './protocols';
import { ServiceLocator } from '@/infrastructure/ServiceLocator';

export abstract class BaseRepositoryImplementation<Model> implements BaseRepository<Model> {

    public async findById(Id: string): Promise<Model | null> {

        const oRows = await cds.run(SELECT.from(this.getEntity()).where({ ID: Id }));

        return this.mapResult(oRows)[0] ?? null;

    }


    public async findByIds(Ids: string[]): Promise<Model[]> {

        if (!Ids.length) {
            return [];
        }

        const oRows = await cds.run(SELECT.from(this.getEntity()).where({ ID: { in: Ids } }));

        return this.mapResult(oRows);

    }


    public async findAll(): Promise<Model[]> {

        const oRows = await cds.run(SELECT.from(this.getEntity()));

        return this.mapResult(oRows);

    }


    public async upsertEntries(Entries: object[]): Promise<void> {

        if (!Entries.length) {
            return;
        }

        await cds.run(UPSERT.into(this.getEntity()).entries(Entries));

    }


    protected getEntity(): entity {

        return ServiceLocator.getEntity(this.entityName());

    }


    protected abstract entityName(): string;


    protected abstract mapResult(Rows: any[]): Model[];

}
