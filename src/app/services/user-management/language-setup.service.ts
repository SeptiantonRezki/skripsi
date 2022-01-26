import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageSetupService extends BaseService {
  public namespace = "language_setup";

  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  create(body?): Observable<any> {
      const url = this.getUrl(this.namespace, "create");
      return this.postApi(url, body);
  }

  update(body?, context?): Observable<any> {
      const url = this.getUrl(this.namespace, "update", context);
      return this.putApi(url, body);
  }
  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  validate(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "validate");
    return this.postApi(url, body);
  }

  export(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postApi(url, body);
  }

  getTranslation(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_translation");
    return this.getApi(url, queryParams);
    // return this.getBlobAsJsonApi(url);
  }

//   getDetail(context?): Observable<any> {
//     const url = this.getUrl(this.namespace, "detail", context);
//     return this.getApi(url);
//   }
}
