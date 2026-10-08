export interface BaseRepository<Model> {
    findById(Id: string): Promise<Model | null>;
    findByIds(Ids: string[]): Promise<Model[]>;
    findAll(): Promise<Model[]>;
    upsertEntries(Entries: object[]): Promise<void>;
}
