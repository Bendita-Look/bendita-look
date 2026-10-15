import cds from '@sap/cds';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12;
const LOCAL_SECRET = 'bendita-look-local-settings';

export class SecretCipher {

    public static isAvailable(): boolean {

        return Boolean(this.secret());

    }


    public static encrypt(Value: string): string {

        const oIv = randomBytes(IV_LENGTH);
        const oCipher = createCipheriv(ALGORITHM, this.key(), oIv);
        const oContent = Buffer.concat([oCipher.update(Value, 'utf8'), oCipher.final()]);

        return [VERSION, oIv, oCipher.getAuthTag(), oContent].map((part) => typeof part === 'string' ? part : part.toString('base64')).join(':');

    }


    public static decrypt(Value: string | undefined): string | null {

        const [sVersion, sIv, sTag, sContent] = (Value ?? '').split(':');

        if (sVersion !== VERSION || !sIv || !sTag || !sContent || !this.isAvailable()) {
            return null;
        }

        try {

            const oDecipher = createDecipheriv(ALGORITHM, this.key(), Buffer.from(sIv, 'base64'));

            oDecipher.setAuthTag(Buffer.from(sTag, 'base64'));

            return Buffer.concat([oDecipher.update(Buffer.from(sContent, 'base64')), oDecipher.final()]).toString('utf8');

        } catch {

            return null;

        }

    }


    private static key(): Buffer {

        const sSecret = this.secret();

        if (!sSecret) {
            throw new Error('No secret available to protect stored credentials');
        }

        return createHash('sha256').update(`${LOCAL_SECRET}:${sSecret}`).digest();

    }


    private static secret(): string | undefined {

        const sClientSecret = (cds.env.requires as any)?.auth?.credentials?.clientsecret as string | undefined;

        return process.env.SETTINGS_SECRET || sClientSecret || (process.env.VCAP_APPLICATION ? undefined : LOCAL_SECRET);

    }

}
