import { AbstractError, MessageArgs } from './abstract';

export class PermissionDenied extends AbstractError {

    constructor(message: string, args?: MessageArgs) {
        super(message, 403, args);
    }

}
