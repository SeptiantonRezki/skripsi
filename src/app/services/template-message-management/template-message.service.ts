import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateMessageService extends BaseService {

  public namespace = 'template_message';
  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    console.log('queryParams', queryParams);
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  create(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "delete");
    return this.postApi(url, body);
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

  getCountry(): Observable<any> {
    const url = this.getUrl("help", "getCountry");
    return this.getApi(url);
  }
}
