export class HTTPError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
    ) {
        super(message);
        this.name = 'HTTPError';
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}