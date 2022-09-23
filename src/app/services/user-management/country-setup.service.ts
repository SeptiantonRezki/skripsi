import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CountrySetupService extends BaseService {
  public namespace = "country_setup";

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
  getRetailerMenus(queryParams?): Observable<any> {
      const url = this.getUrl(this.namespace, "get_menus");
      return this.getApi(url, queryParams);
  }
  getRetailerCategoryMenus(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_category_menus");
    return this.getApi(url);
  }
  getOptionCountry(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_option_country");
      return this.getApi(url, queryParams);
  }

//   getDetail(context?): Observable<any> {
//     const url = this.getUrl(this.namespace, "detail", context);
//     return this.getApi(url);
//   }
}
