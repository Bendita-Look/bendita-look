const DEFAULT_ORIGINS = ['https://davicastr.github.io', 'https://benditalook.github.io'];
const STORE_URL_MAX_LENGTH = 255;
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

export class AllowedOrigins {

    public static includes(Origin: string): boolean {

        const aConfigured = (process.env.CORS_ORIGINS || '').split(',').map((sValue) => sValue.trim()).filter(Boolean);

        return DEFAULT_ORIGINS.includes(Origin) || aConfigured.includes(Origin);

    }


    public static storeUrl(Value: string | undefined): string | undefined {

        if (!Value || Value.length > STORE_URL_MAX_LENGTH) {
            return undefined;
        }

        try {

            const oUrl = new URL(Value);

            if (!ALLOWED_PROTOCOLS.includes(oUrl.protocol) || !this.includes(oUrl.origin)) {
                return undefined;
            }

            oUrl.search = '';
            oUrl.hash = '';

            return oUrl.toString();

        } catch {

            return undefined;

        }

    }

}
