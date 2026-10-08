import { AbstractError, MessageArgs } from './abstract';

export class ConflictError extends AbstractError {

    constructor(message: string, args?: MessageArgs) {
        super(message, 409, args);
    }

}
