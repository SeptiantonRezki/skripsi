import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../node_modules/rxjs';

@Injectable()
export class AccessService extends BaseService{
  public namespace = 'role';
  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getDetail(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }

  getListMenu(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_menu');
    return this.getApi(url);
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }
}
