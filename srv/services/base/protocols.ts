import { User } from '@sap/cds';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';

export interface BaseService<Entity> {
    beforeCreate(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>>;
    beforeUpdate(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>>;
    beforeDelete(Entity: Entity, LoggedUser: User): Promise<Either<AbstractError, boolean>>;
}
