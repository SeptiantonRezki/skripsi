import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class CoinAdjustmentApprovalService extends BaseService {
  public namespace = 'CoinAdjustmentApproval';

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  getTsm(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_tsm');
    return this.getApi(url, queryParams);
  }

  getDetail(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', context);
    return this.getApi(url);
  }
}
