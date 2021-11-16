import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../node_modules/rxjs';

@Injectable()
export class AccessService extends BaseService {
  public namespace = 'role';
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getForceUpdateUsers(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'force_update_user');
    return this.postApi(url, body);
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

  getListLevel(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_other_children", context);
    return this.getApi(url);
  }

  forceUpdate(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'force_update');
    return this.postApi(url, body);
  }

  listVersion(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_version");
    return this.getApi(url);
  }

  revertVersion(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'revert_version', context);
    return this.deleteApi(url);
  }

  deviceOS(): Observable<any> {
    const url = this.getUrl(this.namespace, "device_os");
    return this.getApi(url);
  }

  postForceUpdate(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'force_update_v2');
    return this.postApi(url, body);
  }
}
