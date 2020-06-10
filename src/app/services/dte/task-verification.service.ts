import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class TaskVerificationService extends BaseService {

  public namespace = 'TaskVerification';

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getDetail(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }

  getListAudience(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'listAudience', context);
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  putDate(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_tanggal', context);
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  export(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.postApi(url, body);
  }

  getTradeProgram(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_tp');
    return this.getApi(url);
  }

  getTemplate(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_template');
    return this.getApi(url);
  }

  previewExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_preview');
    return this.postApi(url, body);
  }
  
  storeExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_store');
    return this.postApi(url, body);
  }

  downloadExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_download');
    return this.postApi(url, body);
  }
}
