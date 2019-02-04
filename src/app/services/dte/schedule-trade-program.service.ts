import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleTradeProgramService extends BaseService {

  public namespace = "schedule_trade_program"
  
  constructor(http: HttpClient) { 
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', {schedule_tp_id: id});
    return this.getApi(url);
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

  getListRetailerSelected(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_audience', context);
    return this.getApi(url, queryParams);
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
