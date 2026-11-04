import { OrderRef } from '@models/apps/dflc/benditalook/entities';

export type OrderLookupRef = { Number: number; AccessCode: string };

export class OrderRefs {

    /** Descarta referências inválidas e repetidas; o AccessCode sem espaços nas bordas. */
    public static normalize(Orders: OrderRef[]): OrderLookupRef[] {

        const oRefs = new Map<string, OrderLookupRef>();

        for (const oRef of Orders) {

            const iNumber = oRef?.Number ?? 0;
            const sAccessCode = typeof oRef?.AccessCode === 'string' ? oRef.AccessCode.trim() : '';

            if (Number.isInteger(iNumber) && iNumber > 0 && sAccessCode) {
                oRefs.set(`${iNumber}:${sAccessCode}`, { Number: iNumber, AccessCode: sAccessCode });
            }

        }

        return [...oRefs.values()];

    }


    /** Só casa o par Number + AccessCode exato: o número sozinho não dá acesso ao pedido. */
    public static matches(Refs: OrderLookupRef[], Order: { Number?: number | null; AccessCode?: string | null }): boolean {

        return Refs.some((oRef) => oRef.Number === Order.Number && oRef.AccessCode === Order.AccessCode);

    }

}
