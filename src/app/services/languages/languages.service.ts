import { Injectable } from '@angular/core';
import id from '../../../assets/languages/id.json';
import kh from '../../../assets/languages/kh.json';
import en from '../../../assets/languages/en.json';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguagesService {

  public locale: any;
  public selectedLanguages: string;

  constructor(
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem('user_country');
    if (lang) {
      this.setLanguage(lang);
    } else {
      // DEFAULT LANGUAGES
      this.setLanguage('id');
    }
  }

  public setLanguage(v?: string): void {
    if (v) {
      this.selectedLanguages = v;
      this.translate.setDefaultLang(v);
      this.translate.use(v);
    }
    switch (this.selectedLanguages) {
      case 'id': this.locale = id;
      return;
      case 'en': this.locale = en;
      return;
      case 'kh': this.locale = kh;
      return;
    }
  }

  public withParam(key: string | string[], param: Object) {
    return new Promise((resove, reject) => {
      this.translate.get(key, param).subscribe((res: string) => {
        resove(res);
      }, () => {
        reject('');
      });
    });
  }

}
