import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class InfoBoardService extends BaseService {

  public namespace = "info_board";

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

  put_audience(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_audience', context);
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    console.log('contextnya', context);
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  detail(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'detail', {id: context});
    return this.getApi(url);
  }

  checkAudience(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'check_audience');
    return this.postApi(url, body);
  }

  saveAudience(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'save_audience', {id: context});
    return this.postApi(url, body);
  }

  put_preview(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_preview", context);
    return this.postApi(url, body);
  }

  downloadWinner(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'download_winner', {id: context});
    return this.getApi(url);
  }

  put_winner(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_winner", context);
    return this.postApi(url, body);
  }

  publishUnpublish(context: any, body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_publish", context);
    return this.postApi(url, body);
  }

  exportDetailCoupon(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_detail_coupon", {id: context});
    return this.getApi(url, {});
  }

  exportCoupon(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_coupon", {id: context});
    return this.getApi(url, {});
  }
}
