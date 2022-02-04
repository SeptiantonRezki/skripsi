import { Injectable } from '@angular/core';
import id from '../../../assets/languages/id.json';
import km from '../../../assets/languages/km.json';
import en_ph from '../../../assets/languages/en-ph.json';
import { TranslateService } from '@ngx-translate/core';
import { GeneralService } from "../general.service";
import { GeneralBackendService } from '../general-backend.service';

@Injectable()
export class LanguagesService {

  public locale: any;
  public selectedLanguages: string;

  constructor(
    private translate: TranslateService,
    private generalBackendService: GeneralBackendService,
  ) {
    const lang = localStorage.getItem('user_country');
    this.locale = id;
    if (lang) {
      // this.setLanguage(lang);
    } else {
      // DEFAULT LANGUAGES
      // this.setLanguage('id');
      // localStorage.setItem('user_country', 'id');
    }
  }

  initLang() {
    return new Promise<void>((resolve, reject) => {
      const localCode = localStorage.getItem("user_country");
      if (localCode) {
        this.selectedLanguages = localCode;
        this.setLangHTML(localCode);
        this.translate.use(localCode);
        resolve();
      } else {
        this.generalBackendService.getCountry().subscribe(
          (res) => {
            let code = res.data.locale_code.toLowerCase();
            this.selectedLanguages = code;
            this.setLangHTML(code);
            localStorage.setItem('user_country', code);
            this.translate.use(code);
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
      this.setLangHTML(v);
    }
    switch (this.selectedLanguages) {
      case 'id': this.locale = id;
        return;
      case 'en-ph': this.locale = en_ph;
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
  setLangHTML(val) {
    try {
      const elm = document.getElementsByTagName('html');
      elm[0].setAttribute('lang', val);
    } catch (error) {
      console.log({error});
    }
  }

}
