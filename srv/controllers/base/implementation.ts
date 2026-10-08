import { User } from '@sap/cds';
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/errors';
import { BaseService } from '@/services/base';
import { BaseController, BaseControllerResponse } from './protocols';

export abstract class BaseControllerImplementation<Entity> implements BaseController<Entity> {

    protected abstract Service: BaseService<Entity>;


    public async beforeCreate(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.beforeCreate(Entity, LoggedUser), 201);

    }


    public async beforeUpdate(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.beforeUpdate(Entity, LoggedUser), 204);

    }


    public async beforeDelete(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse> {

        return this.respond(await this.Service.beforeDelete(Entity, LoggedUser), 204);

    }


    protected respond<Result>(Result: Either<AbstractError, Result>, SuccessStatus: number): BaseControllerResponse {

        if (Result.isLeft()) {
            return this.error(Result.value);
        }

        return this.success(SuccessStatus, Result.value);

    }


    protected success(Status: number, Data: unknown): BaseControllerResponse {

        return { status: Status, data: Data };

    }


    protected error(Error: AbstractError): BaseControllerResponse {

        return { status: Error.code, data: Error.message, args: Error.args };

    }

}
