import cds, { User } from '@sap/cds';
import { Either, left, right } from '@sweet-monads/either';
import { AbstractError, ServerError } from '@/errors';
import { BaseService } from './protocols';

export abstract class BaseServiceImplementation<Entity> implements BaseService<Entity> {

    public async beforeCreate(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return right(true);

    }


    public async beforeUpdate(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return right(true);

    }


    public async beforeDelete(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>> {

        return right(true);

    }


    protected async execute<Result>(Operation: () => Promise<Either<AbstractError, Result>>): Promise<Either<AbstractError, Result>> {

        try {

            return await Operation();

        } catch (oError) {

            cds.log(this.constructor.name).error(oError);

            return left(ServerError.from(oError));

        }

    }


    protected isBlank(value: unknown): boolean {

        return typeof value !== 'string' || value.trim().length === 0;

    }


    protected generateUUID(): string {

        return cds.utils.uuid();

    }

}
