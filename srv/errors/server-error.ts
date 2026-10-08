import { AbstractError } from './abstract';

export class ServerError extends AbstractError {

    constructor(message = 'error.unknownError') {
        super(message, 500);
    }

    public static from(error: unknown): ServerError {

        const serverError = new ServerError();

        serverError.stack = (error as Error)?.stack;

        return serverError;

    }

}
