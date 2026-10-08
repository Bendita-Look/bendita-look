import { ApplicationService } from '@sap/cds';
import { BaseController } from '@/controllers/base';
import { BaseRoute } from '../base';
import { MainRoute } from './protocols';
import { BaseRouteImplementation } from '../base/implementation';

export class MainRouteImplementation extends BaseRouteImplementation<unknown> implements MainRoute {

    protected readonly Controller = null as unknown as BaseController<unknown>;

    constructor(private readonly Routes: BaseRoute[]) {

        super();

    }


    public main(Service: ApplicationService): void {

        this.registerRequestContext(Service);

        this.Routes.forEach((oRoute) => oRoute.main(Service));

    }

}
