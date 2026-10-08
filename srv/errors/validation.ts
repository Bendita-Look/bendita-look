import { AbstractError, MessageArgs } from './abstract';

export class ValidationError extends AbstractError {

    constructor(message: string, args?: MessageArgs) {
        super(message, 400, args);
    }

}
