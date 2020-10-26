
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class B2CVoucherService extends BaseService {
  namespace = 'b2c_voucher';
  constructor(http: HttpClient) {
    super(http);
  }

  getListVoucher(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getListVoucher');
    return this.getApi(url, queryParams);
  }

  getDetailVoucher(context?: any,): Observable<any> {
    const url = this.getUrl(this.namespace, 'getDetailVoucher', context);
    return this.getApi(url);
  }

  createVoucher(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'createVoucher');
    return this.postApi(url, body);
  }

  updateVoucher(context?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'updateVoucher', context);
    return this.putApi(url, body);
  }

  deleteVoucher(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'deleteVoucher', context);
    return this.deleteApi(url);
  }

  getListReimbursement(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getListReimbursement');
    return this.getApi(url, queryParams);
  }

  exportListReimbursement(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportListReimbursement');
    return this.getBlobAsJsonApi(url, queryParams);
  }

  getProductList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'product_list');
    return this.getApi(url, queryParams);
  }

  getSelectedRetailerPanel(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getSelectedRetailerPanel', context);
    return this.getApi(url);
  }

  getSelectedCustomerPanel(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getSelectedCustomerPanel', context);
    return this.getApi(url);
  }

  getAudienceRetailer(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getAudienceRetailer');
    return this.getApi(url, queryParams);
  }

  exportAudienceRetailer(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportAudienceRetailer');
    return this.postBlobApi(url, body);
  }

  importAudienceRetailer(body?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'importAudienceRetailer',);
    return this.postApi(url, body, queryParams);
  }

  getAudienceCustomer(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getAudienceCustomer');
    return this.getApi(url, queryParams);
  }

  exportAudienceCustomer(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportAudienceCustomer');
    return this.postBlobApi(url, body);
  }

  importAudienceCustomer(body?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'importAudienceCustomer');
    return this.postApi(url, body, queryParams);
  }

  updatePanel(context?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'updatePanel', context);
    return this.putApi(url, body);
  }

  getNominal(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getNominal');
    return this.getApi(url, queryParams);
  }

  updatePenukaranVoucher(context?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'updatePenukaranVoucher', context);
    return this.putApi(url, body);
  }

  updateDesign(context?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'updateDesign', context);
    return this.postApi(url, body);
  }

  getListDetailVoucher(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getListDetailVoucher', context);
    return this.getApi(url, queryParams);
  }

  exportListDetailVoucher(context: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportListDetailVoucher', context);
    return this.getBlobAsJsonApi(url, queryParams);
  }

}
