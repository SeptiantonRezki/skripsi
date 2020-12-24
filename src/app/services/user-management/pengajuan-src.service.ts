import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PengajuanSrcService extends BaseService {
  public namespace = "pengajuan_src";

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

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  updateStatus(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "update_status", context);
    return this.postApi(url, body);
  }

  export(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.getBlobApi(url, queryParams);
  }

  getProducts(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_product');
    return this.getApi(url, queryParams);
  }

  getSources(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_source');
    return this.getApi(url, queryParams);
  }

  getChannels(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_channel');
    return this.getApi(url, queryParams);
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

  getSubDistricts(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_territory');
    return this.getApi(url, queryParams);
  }

}
