export class StoreUrl {

    /** Base da vitrine para montar rotas de hash (#/...); o fragmento salvo na configuração é descartado. */
    public static rootOf(Url: string | null | undefined): string {

        const sUrl = Url?.trim() || process.env.STORE_URL?.trim() || '';

        return sUrl.split('#')[0];

    }

}
