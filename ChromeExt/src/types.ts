export class APITokenError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export enum MessageType {
    SHOW_ALERT = "SHOW_ALERT",
    LOGIN_REQUIRED = "LOGIN_REQUIRED",
    OPEN_LOGIN_PAGE = "OPEN_LOGIN_PAGE",
}