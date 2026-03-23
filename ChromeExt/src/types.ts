export class APITokenError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export enum MessageType {
    LOADING = "LOADING",
    SHOW_ALERT = "SHOW_ALERT",
    LOGIN_REQUIRED = "LOGIN_REQUIRED",
    OPEN_LOGIN_PAGE = "OPEN_LOGIN_PAGE",
    OPEN_WEB_APP = "OPEN_WEB_APP",
}