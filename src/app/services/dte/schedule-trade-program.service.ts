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

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getTradeProgram(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_tp', context);
    return this.getApi(url);
  }

  getTemplate(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_template', context);
    return this.getApi(url);
  }

  getListRetailerSelected(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_audience', context);
    return this.getApi(url, queryParams);
  }
}
