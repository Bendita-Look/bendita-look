import cds, { entity, Request } from '@sap/cds';
import { ADMIN_SERVICE, ENTITIES_NAMESPACE } from '@/constants/entities';

export class ServiceLocator {

    public static setRequest(Request: Request): void {

        (cds.context as any)._request = Request;

    }


    public static getRequest(): Request {

        return (cds.context as any)?._request as Request;

    }


    public static getLocale(): string | undefined {

        return this.getRequest()?.locale;

    }


    public static getClientIp(): string {

        const httpRequest = (cds.context as any)?.http?.req;

        const forwardedFor = httpRequest?.headers?.['x-forwarded-for'] as string | undefined;

        return forwardedFor?.split(',').pop()?.trim() || httpRequest?.ip || 'unknown';

    }


    public static afterCommit(callback: () => Promise<void>): void {

        this.getRequest()?.on('succeeded', () => {

            cds.spawn({ user: cds.User.privileged }, async () => {

                try {

                    await callback();

                } catch (oError) {

                    cds.log('after-commit').error(oError);

                }

            });

        });

    }


    public static getEntity(EntityName: string): entity {

        return cds.entities(ENTITIES_NAMESPACE)[EntityName] as entity;

    }


    public static getDraftEntity(EntityName: string): entity {

        return (cds.entities(ADMIN_SERVICE)[EntityName] as entity).drafts as entity;

    }

}
