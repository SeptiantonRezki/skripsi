import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewSignService extends BaseService {
  namespace = "new_sign_menu";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  show(queryParams?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url, queryParams);
  }

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getIconList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'icon_list');
    return this.getApi(url, queryParams);
  }

  getMenuList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'menu_list');
    return this.getApi(url, queryParams);
  }

  getGeneralNewSign(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'genereal_new_sign');
    return this.getApi(url, queryParams);
  }
}
