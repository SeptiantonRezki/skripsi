import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class NotificationService extends BaseService {
  public namespace = 'notification';

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent", context);
    return this.getApi(url);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl("general", "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_other_children", context);
    return this.getApi(url);
  }

  getPopup(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_popup');
    return this.getApi(url, queryParams);
  }

  getById(queryParams?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show_popup', context);
    return this.getApi(url, queryParams);
  }

  createPopup(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_popup');
    return this.postApi(url, body);
  }

  updatePopup(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_popup', context);
    return this.postApi(url, body);
  }

  deletePopup(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_popup', context);
    return this.deleteApi(url);
  }

  getPopupAudience(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_audience");
    return this.getApi(url, queryParams);
  }
}
