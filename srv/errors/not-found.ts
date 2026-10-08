import { AbstractError, MessageArgs } from './abstract';

export class NotFoundError extends AbstractError {

    constructor(message: string, args?: MessageArgs) {
        super(message, 404, args);
    }

}
