import { User } from '@sap/cds';
import { MessageArgs } from '@/errors';

export type BaseControllerResponse = {
    status: number;
    data: unknown;
    args?: MessageArgs;
};

export interface BaseController<Entity> {
    beforeCreate(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse>;
    beforeUpdate(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse>;
    beforeDelete(Entity: Entity, LoggedUser: User): Promise<BaseControllerResponse>;
}
