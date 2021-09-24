import { Injectable } from '@angular/core';
import id from '../../../assets/languages/id.json';
import km from '../../../assets/languages/km.json';
import en from '../../../assets/languages/en.json';
import { TranslateService } from '@ngx-translate/core';
import { GeneralService } from "../general.service";

@Injectable()
export class LanguagesService {

  public locale: any;
  public selectedLanguages: string;

  constructor(
    private translate: TranslateService,
    private generalService: GeneralService
  ) {
    const lang = localStorage.getItem('user_country');
    if (lang) {
      this.setLanguage(lang);
    } else {
      // DEFAULT LANGUAGES
      this.setLanguage('id');
      localStorage.setItem('user_country', 'id');
    }
  }

  initLang() {
    return new Promise<void>((resolve, reject) => {
      const localCode = localStorage.getItem("user_country");
      if (localCode !== null) {
        this.translate.use(localCode);
        resolve();
      } else {
        this.generalService.getCountry().subscribe(
          (res) => {
            let code = res.data.country_code.toLowerCase();
            localStorage.setItem('user_country', code);
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
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
      case 'km': this.locale = km;
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
