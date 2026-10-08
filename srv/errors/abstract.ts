export type MessageArgs = Record<string, string | number>;

export class AbstractError extends Error {

    public readonly code: number;
    public readonly args?: MessageArgs;

    constructor(message: string, code: number, args?: MessageArgs) {

        super(message);

        this.code = code;
        this.args = args;

    }

}
