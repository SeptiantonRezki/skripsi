import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourierService extends BaseService {
  namespace = "courier";
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url, {});
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  update(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "update", context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }
}
