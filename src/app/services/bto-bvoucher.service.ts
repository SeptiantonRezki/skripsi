import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BtoBVoucherService extends BaseService {
  namespace = "b2b_voucher";
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

  // update(body?, context?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "update", context);
  //   return this.putApi(url, body);
  // }

  // delete(context?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "delete", context);
  //   return this.deleteApi(url);
  // }
}
