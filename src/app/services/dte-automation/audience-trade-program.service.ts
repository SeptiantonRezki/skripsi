import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudienceTradeProgramService extends BaseService {
  public namespace = "dte_automation";
  constructor(http: HttpClient) {
    super(http);
  }

  getAudienceGroups(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_audience_groups");
    return this.getApi(url, queryParams);
  }

  getTradePrograms(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_trade_program");
    return this.getApi(url, queryParams);
  }
}
