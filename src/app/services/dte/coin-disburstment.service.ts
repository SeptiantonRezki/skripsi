import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class CoinDisburstmentService extends BaseService {
  public namespace = "CoinDisburstment";
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getExhanges(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_exchanges');
    return this.getApi(url, queryParams);
  }

  getDetail(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }

  create(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  update(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update", context);
    return this.postApi(url, body);
  }

  delete(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  getListAudience(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, "audience", context);
    return this.getApi(url);
  }

  exportExchange(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_exchange");
    return this.postApi(url, body);
  }

  importExchange(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "import_exchange");
    return this.postApi(url, body);
  }

  previewImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'preview_exchange');
    return this.postApi(url, body);
  }

}
