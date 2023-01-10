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
    return this.postApi(url, queryParams);
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

  export(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postApi(url, body);
  }

  exportExchange(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_exchange");
    return this.postApi(url, body);
  }

  exportDetail(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_detail");
    return this.postApi(url, body);
  }

  download(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "download");
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

  getDataLog(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'data_log_get');
    return this.getApi(url, queryParams);
  }

  dataLogPreview(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'data_log_preview');
    return this.postApi(url, body);
  }

  dataLogImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'data_log_import');
    return this.postApi(url, body);
  }

  dataLogExport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'data_log_export');
    return this.postBlobApi(url, body);
  }

}
