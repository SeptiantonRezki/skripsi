import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorsService extends BaseService {
  namespace = "vendors"

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.getApi(url, {});
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  update(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.putApi(url, body);
  }

  updateWithParams(context?, body?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.putWithParamsApi(url, body, queryParams);
  }

  delete(context, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url, queryParams);
  }

  forceDelete(context, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteWithParamsApi(url, null, queryParams);
  }

  getVendorAddress(context): Observable<any> {
    const url = this.getUrl(this.namespace, "address_map", context);
    return this.getApi(url, {});
  }

  getOperationalTime(): Observable<any> {
    const url = this.getUrl(this.namespace, "operational_time");
    return this.getApi(url, {});
  }

  getChatTemplate(): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template");
    return this.getApi(url, {}); ''
  }

  saveChatTemplate(body): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template");
    return this.postApi(url, body);
  }
}
