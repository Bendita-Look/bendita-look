import { AbstractError } from './abstract';

export class TooManyRequestsError extends AbstractError {

    constructor(message = 'error.tooManyRequests') {
        super(message, 429);
    }

}
