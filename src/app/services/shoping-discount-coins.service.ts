import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopingDiscountCoinsService extends BaseService {
  namespace = 'shoping_discount_coins';
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url, {});
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  update(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.putApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.deleteApi(url);
  }

  getRetailer(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_retailer');
    return this.postApi(url, body, queryParams);
  }

  getMitra(queryParams?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_mitra');
    return this.postApi(url, body, queryParams);
  }

  getSelectedRetailer(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'selected_retailer', context);
    return this.getApi(url)
  }

  getSelectedMitra(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'selected_mitra', context);
    return this.getApi(url)
  }

  updatePanel(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_panel', context);
    return this.postApi(url, body);
  }

  exportInvoice(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export_invoice', context);
    return this.getApi(url);
  }

  exportExcel(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export_excel', context);
    return this.getBlobAsJsonApi(url);
  }

  getRedeems(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeem', context);
    return this.getApi(url, queryParams);
  }

  exportRetailer(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export_panel', context);
    return this.postBlobAsJsonApi(url, body);
  }

  exportMitra(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export_panel', context);
    return this.postBlobAsJsonApi(url, body);
  }

  importFile(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'import_panel');
    return this.postApi(url, body);
  }

  previewImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'preview_import');
    return this.getApi(url, queryParams);
  }

  getProductList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'product_list');
    return this.getApi(url, queryParams);
  }

  getProductListVendor(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'product_list_vendor');
    return this.getApi(url, queryParams);
  }

  redeemExport(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeem_export', context);
    return this.getBlobAsJsonApi(url);
  }

  redeemImportPreview(body: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeem_import_preview', context);
    return this.postApi(url, body);
  }

  redeemImportSubmit(body: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'redeem_import_submit', context);
    return this.postApi(url, body);
  }

  getVoucherB2CList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'listVoucherB2C');
    return this.getApi(url, queryParams);
  }

  changeStatus(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "change_status", context);
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
