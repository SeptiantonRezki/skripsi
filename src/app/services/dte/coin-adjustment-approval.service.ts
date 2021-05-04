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

  getListAudience(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'listAudience', context);
    return this.getApi(url, queryParams);
  }

  respondApproval(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'respond_approval', context);
    return this.postApi(url, body);
  }

  approverList(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'approver_list', context);
    return this.getApi(url, queryParams);
  }

  sendNotification(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'send_notification', context);
    return this.postApi(url, body);
  }

  downloadApprovalList(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'download_list_approval', context);
    console.log('url', url, context);
    return this.getApi(url);
  }

  getApprovers(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'approver_data', context);
    return this.getApi(url, queryParams);
  }

  getRequestors(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'requestor_data', context);
    return this.getApi(url, queryParams);
  }
}
