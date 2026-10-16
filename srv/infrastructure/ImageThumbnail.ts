import cds from '@sap/cds';
import sharp from 'sharp';

const THUMBNAIL = { width: 112, height: 148, quality: 75 };

export class ImageThumbnail {

    public static readonly contentType = 'image/jpeg';

    public static readonly extension = 'jpg';


    public static async create(Content: Buffer): Promise<Buffer | null> {

        try {

            return await sharp(Content)
                .rotate()
                .resize(THUMBNAIL.width, THUMBNAIL.height, { fit: 'cover' })
                .jpeg({ quality: THUMBNAIL.quality, mozjpeg: true })
                .toBuffer();

        } catch (oError) {

            cds.log('email').warn('Email thumbnail could not be created:', (oError as Error).message);

            return null;

        }

    }

}
