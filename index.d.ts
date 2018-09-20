
/// <reference types="hapi" />

import {
    Plugin,
    Request,
    ResponseObject,
} from 'hapi';

declare namespace hapiError{
    interface Options {
        statusCodes?: {};
    }
    type handleError = (error: Error, errorMessage: string) => boolean;
}


declare const hapiError: Plugin<hapiError.Options>;

export = hapiError;

declare module 'hapi' {
    interface Request {
        handleError: hapiError.handleError;
    }
}
