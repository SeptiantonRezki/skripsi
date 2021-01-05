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

  storeVendorAddress(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, "address_map", context);
    return this.postApi(url, body);
  }

  getOperationalTime(): Observable<any> {
    const url = this.getUrl(this.namespace, "operational_time");
    return this.getApi(url, {});
  }

  saveOperationalTime(body): Observable<any> {
    const url = this.getUrl(this.namespace, "operational_time");
    return this.postApi(url, body);
  }

  getChatTemplate(): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template");
    return this.getApi(url, {});
  }

  saveChatTemplate(body): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template");
    return this.postApi(url, body);
  }

  getChatTemplateOperational(): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template_operational");
    return this.getApi(url, {});
  }

  saveChatTemplateOperational(body): Observable<any> {
    const url = this.getUrl(this.namespace, "chat_template_operational");
    return this.postApi(url, body);
  }

  getProvinces(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_province');
    return this.getApi(url);
  }

  getCities(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_city', context);
    return this.getApi(url);
  }

  getDistricts(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_district', context);
    return this.getApi(url);
  }

  getSubDistricts(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_subdistrict', context);
    return this.getApi(url);
  }
}
