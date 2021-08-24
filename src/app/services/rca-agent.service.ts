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
}