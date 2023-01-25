import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LanguagesService } from 'app/services/languages/languages.service';

/**
 * Generated class for the SafeHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'translateInterpolate',
})
export class TranslateInterpolatePipe implements PipeTransform {

    constructor(
        private sanitizer: DomSanitizer,
        private ls: LanguagesService,
    ) { }

    async transform(html: string, params: any, sanitize = true) {
        let result = html;
        try {
            const getInside = new RegExp("[^{\{]+(?=}\})", 'g');
            const getParams = new RegExp("[^[]+(?=])", "g");
            
            let keys = result.match(getInside);

            if (keys && keys.length) {
                await keys.map(async (key) => {
                    const value = await this.ls.translate.get(key).toPromise();
                    result = result.replace(`{{${key}}}`, value);
                    console.log({result});

                });
            }
            let matches = result.match(getParams);
            if(matches && matches.length) {
                await matches.map(async (match) => {
                    const value = params[match] || '-';
                    result = result.replace(`[${match}]`, value);
                })
            }
            // console.log({match});


            //   console.log({reg, res})
            if(sanitize && this.sanitizer) {
                return this.sanitizer.bypassSecurityTrustHtml(result);
            } else {
                return result;
            }

        } catch (error) {
            console.error({error});
            if(sanitize && this.sanitizer) {
                return this.sanitizer.bypassSecurityTrustHtml(result);
            } else {
                return result;
            }

        }
    }

}