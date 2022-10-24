import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class LotteryService extends BaseService {

  public namespace = "lottery";

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

  showAudience(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'show_audience', {id: context});
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

  publishUnpublish(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update_publish");
    return this.postApi(url, body);
  }

  exportDetailCoupon(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_detail_coupon");
    return this.postApi(url, body);
  }

  exportCoupon(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "export_coupon");
    return this.postApi(url, body);
  }
  exportExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, "export_lottery");
    return this.postApi(url, body);
  }
  importExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, "import_lottery");
    return this.postApi(url, body);
  }
  showImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "show_import_lottery");
    return this.getApi(url, queryParams);
  }
}
