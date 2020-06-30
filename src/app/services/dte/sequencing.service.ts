import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})

export class SequencingService extends BaseService {

  public namespace = "sequencing";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
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

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getListTradePrograms(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_trade_program");
    return this.getApi(url, queryParams);
  }

  getListTradeAudienceGroup(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_trade_audience__group");
    return this.getApi(url, queryParams);
  }

}
