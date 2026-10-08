import fs from 'fs';
import path from 'path';
import handlebars, { TemplateDelegate } from 'handlebars';

export class TemplateRenderer {

    private readonly templates = new Map<string, TemplateDelegate>();

    constructor(private readonly directory: string) { }


    public render(TemplateName: string, Context: object): string {

        return this.getTemplate(TemplateName)(Context);

    }


    private getTemplate(TemplateName: string): TemplateDelegate {

        let oTemplate = this.templates.get(TemplateName);

        if (!oTemplate) {

            const sSource = fs.readFileSync(path.join(this.directory, `${TemplateName}.html`), 'utf8');

            oTemplate = handlebars.compile(sSource);

            this.templates.set(TemplateName, oTemplate);

        }

        return oTemplate;

    }

}
