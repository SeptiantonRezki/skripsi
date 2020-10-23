import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class B2BVoucherInjectService extends BaseService {
  namespace = 'b2b_voucher_inject';
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url, {});
  }

  create(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  update(context?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.putApi(url, body);
  }

  getRetailer(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelRetailerList');
    return this.postApi(url, body, queryParams);
  }

  getMitra(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelMitraList');
    return this.postApi(url, body, queryParams);
  }

  getSelectedRetailer(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'selectedRetailer', context);
    return this.getApi(url);
  }

  getSelectedMitra(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'selectedMitra', context);
    return this.getApi(url);
  }

  updatePanel(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'updatePanel', context);
    return this.postApi(url, body);
  }

  exportInvoice(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportInvoice', context);
    return this.getApi(url);
  }

  exportExcel(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportExcel', context);
    return this.getBlobAsJsonApi(url);
  }

  exportRetailer(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelExport', context);
    return this.postBlobAsJsonApi(url, body);
  }

  exportMitra(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelExport', context);
    return this.postBlobAsJsonApi(url, body);
  }

  importFile(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelImport');
    return this.postApi(url, body);
  }

  previewImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'panelPreviewImport');
    return this.getApi(url, queryParams);
  }

  getProductList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'product_list');
    return this.getApi(url, queryParams);
  }

  getRedeems(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'getRedeem', context);
    return this.getApi(url, queryParams);
  }

  redeemExport(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeemExport', context);
    return this.getBlobAsJsonApi(url);
  }

  redeemImportPreview(body: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeemImport', context);
    return this.postApi(url, body);
  }

  redeemImportSubmit(body: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeemSubmitImport', context);
    return this.postApi(url, body);
  }
  // update(body?, context?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "update", context);
  //   return this.putApi(url, body);
  // }

  // delete(context?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "delete", context);
  //   return this.deleteApi(url);
  // }
}
