const ENTITIES: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x3D;': '='
};

export class HtmlText {

    public static from(Html: string): string {

        const sText = Html
            .replace(/<(head|style|script)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<img[^>]*>/gi, '')
            .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, sUrl: string, sLabel: string) => `${this.strip(sLabel)}: ${sUrl}`)
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, '\n')
            .replace(/<\/t[dh]>/gi, '  ')
            .replace(/<li[^>]*>/gi, '- ');

        return this.decode(this.strip(sText))
            .split('\n')
            .map((sLine) => sLine.replace(/[ \t]+/g, ' ').trim())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

    }


    private static strip(Html: string): string {

        return Html.replace(/<[^>]+>/g, '');

    }


    private static decode(Text: string): string {

        return Text.replace(/&[#\w]+;/g, (sEntity) => ENTITIES[sEntity] ?? sEntity);

    }

}
