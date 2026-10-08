import type { NextFunction, Request, Response } from 'express';

const DEFAULT_ORIGINS = ['https://davicastr.github.io'];

function isAllowedOrigin(origin: string): boolean {
    const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map((value) => value.trim());

    return DEFAULT_ORIGINS.includes(origin) || configuredOrigins.includes(origin);
}

const ALLOWED_METHODS =
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';

const ALLOWED_HEADERS =
    'Content-Type, Authorization, x-csrf-token, Prefer, If-Match, If-None-Match, sap-context-token, sap-context-token-accept, sap-cancel-on-close, sap-correlationid, x-sap-security-session, mime-version, odata-version, odata-maxversion';

const EXPOSE_HEADERS =
    'x-csrf-token, OData-Version, odata-version, SAP-Message, sap-message, ETag, Location';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;

    if (origin && isAllowedOrigin(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
        res.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
        res.set('Access-Control-Expose-Headers', EXPOSE_HEADERS);
        res.set('Vary', 'Origin');

        if (req.method === 'OPTIONS') {
            res.status(204).end();
            return;
        }
    }

    next();
}