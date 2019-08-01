import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportListService extends BaseService {
  public namespace = "report_list";
  constructor(http: HttpClient) {
    super(http)
  }

  getReport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_report");
    return this.getApi(url, queryParams);
  }

  getReportHistory(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_history");
    return this.getApi(url, queryParams);
  }

  update(body?, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update", context);
    return this.putApi(url, body);
  }

  show(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url);
  }

  detail(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.getApi(url, queryParams);
  }
}
