import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages/languages.service';

@Pipe({name: 'breadcrumbtranslate'})
export class BreadCrumbTranslatePipe implements PipeTransform {

    constructor(
        private ls: LanguagesService,
        public translate: TranslateService,
    ) {
        
    }
  async transform(value: string, args: any[] = []) {
      console.log({value})
      let name = '';
      try {
          name = await this.translate.get(value).toPromise();
      } catch (error) {
          console.log({error});
      }
    return (name) ? name : value;
  }
}
