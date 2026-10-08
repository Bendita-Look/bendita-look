import { Readable } from 'stream';

export class StreamConverter {

    public static async toBuffer(content: unknown): Promise<Buffer | null> {

        if (!content) {
            return null;
        }

        if (Buffer.isBuffer(content)) {
            return content;
        }

        if (typeof content === 'string') {
            return Buffer.from(content, 'base64');
        }

        if (content instanceof Readable) {

            const chunks: Buffer[] = [];

            for await (const chunk of content) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            return Buffer.concat(chunks);

        }

        return null;

    }

}
