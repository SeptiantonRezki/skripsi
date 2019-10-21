import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HelpService extends BaseService {

  public namespace = 'help';
  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    console.log('queryParams', queryParams);
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body?, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  getListCategory(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getListCategory");
    return this.getApi(url, queryParams);
  }

  getListUser(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getListUser");
    return this.getApi(url, queryParams);
  }

  getShow(queryParams?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getShow", context);
    return this.getApi(url, queryParams);
  }
}
