import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RcaAgentService extends BaseService {
  public namespace = "rca_agent";

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getPositionCode(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "position_code", context);
    return this.getApi(url)
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  getDetail(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.getApi(url);
  }

  // Grouping Pelanggan
  getGroupingPelanggan(queryParams?): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "get");
    return this.getApi(url, queryParams);
  }

  getGPSummary(queryParams): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "summary");
    return this.getApi(url, queryParams);
  }


  // Route Plan
  getRoutePlan(queryParams?): Observable<any> {
    const url = this.getUrl("route_plan", "get");
    return this.getApi(url, queryParams);
  }

  getRPSummary(queryParams): Observable<any> {
    const url = this.getUrl("route_plan", "summary");
    return this.getApi(url, queryParams);
  }

  getRPPositionCode(queryParams?): Observable<any> {
    const url = this.getUrl("route_plan", "position_codes");
    return this.getApi(url, queryParams)
  }
}