import cds from '@sap/cds';
import { MessageArgs } from '@/errors';

const DEFAULT_LOCALE = 'pt';

export class Messages {

    public static text(key: string, locale: string | undefined, args?: MessageArgs): string {

        return cds.i18n.messages.at(key, locale || DEFAULT_LOCALE, args) as string || key;

    }

}
