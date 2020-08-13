import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class TaskVerificationService extends BaseService {

  public namespace = 'TaskVerification';

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
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

  listReason(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'listReason', context);
    return this.getApi(url);
  }

  totalSRC(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'totalSRC', context);
    return this.getApi(url);
  }

  verificationAll(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'verificationAll');
    return this.postApi(url, body);
  }

  verification(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'verification');
    return this.postApi(url, body);
  }

  releaseCoinAll(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'releaseCoinAll');
    return this.postApi(url, body);
  }

  releaseCoin(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'releaseCoin');
    return this.postApi(url, body);
  }

  submission(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'submission');
    return this.postApi(url, body);
  }

  export(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.postApi(url, body);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  putDate(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_tanggal', context);
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getTradeProgram(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_tp');
    return this.getApi(url);
  }

  getTemplate(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_template');
    return this.getApi(url);
  }

  previewExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_preview');
    return this.postApi(url, body);
  }
  
  storeExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_store');
    return this.postApi(url, body);
  }

  downloadExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'csv_download');
    return this.postApi(url, body);
  }

  // TSM Version

  getTsm(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getTsm');
    return this.getApi(url, queryParams);
  }

  getDetailTsm(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'detailTsm', context);
    return this.getApi(url);
  }

  getListAudienceTsm(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'listAudienceTsm', context);
    return this.getApi(url, queryParams);
  }

  listReasonTsm(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'listReasonTsm', context);
    return this.getApi(url);
  }

  verificationAllTsm(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'verificationAllTsm');
    return this.postApi(url, body);
  }

  verificationTsm(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'verificationTsm');
    return this.postApi(url, body);
  }

  releaseCoinAllTsm(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'releaseCoinAllTsm');
    return this.postApi(url, body);
  }

  releaseCoinTsm(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'releaseCoinTsm');
    return this.postApi(url, body);
  }

  submissionTsm(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'submissionTsm');
    return this.postApi(url, body);
  }

  exportTsm(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.postApi(url, body);
  }
}
