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

  put(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.putApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.deleteApi(url);
  }

  getCurrentPositionCode(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "current_position_code", context);
    return this.getApi(url)
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

  setMappingPosition(body?): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "mapping_position");
    return this.postApi(url, body);
  }

  exportGrouping(body?): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "export");
    return this.postBlobAsJsonApi(url, body);
  }

  importGrouping(body?): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "import");
    return this.postApi(url, body);
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

  setRPMappingPosition(body?): Observable<any> {
    const url = this.getUrl("route_plan", "mapping_position");
    return this.postApi(url, body);
  }

  exportRoutePlan(body?): Observable<any> {
    const url = this.getUrl("route_plan", "export");
    return this.postBlobAsJsonApi(url, body);
  }

  importRoutePlan(body?): Observable<any> {
    const url = this.getUrl("route_plan", "import");
    return this.postApi(url, body);
  }

  getFilterArea(queryParams?): Observable<any> {
    const url = this.getUrl("grouping_pelanggan", "area_filter");
    return this.getApi(url, queryParams);
  }
}