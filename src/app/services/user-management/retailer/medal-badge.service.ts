import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../../node_modules/rxjs';

@Injectable()
export class MedalBadgeService extends BaseService {
  public namespace = 'medalBadge';

  constructor(http: HttpClient) {
    super(http);
  }

  getMedalList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'medal');
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'putMedal', context);
    return this.getApi(url);
  }

  create(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'medal');
    return this.postApi(url, body);
  }

  put(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'putMedal', context);
    return this.putApi(url, body);
  }

  delete(context: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'putMedal', context);
    return this.deleteApi(url);
  }

  getRetailerList(queryParams?: any, body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'retailerList');
    return this.postApi(url, body, queryParams);
  }

  getMedalCategory(): Observable<any> {
    const url = this.getUrl(this.namespace, 'medalCategory');
    return this.getApi(url);
  }

  importRetailer(): Observable<any> {
    const url = this.getUrl(this.namespace, 'importRetailer');
    return this.getApi(url);
  }

  previewImportRetailer(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'previewImportRetailer');
    return this.postApi(url, body);
  }

  exportRetailer(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportRetailer');
    return this.postBlobAsJsonApi(url, body);
  }

  // getConsumerList(context?): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'consumer_list', context);
  //   return this.getApi(url);
  // }

  // getParentArea(context?): Observable<any> {
  //   const url = this.getUrl('general', 'parent_by_code', context);
  //   return this.getApi(url);
  // }

  // getListLevel(): Observable<any> {
  //   const url = this.getUrl('general', 'list_level');
  //   return this.getApi(url);
  // }

  // getListChildren(context): Observable<any> {
  //   const url = this.getUrl('general', 'list_children', context);
  //   return this.getApi(url);
  // }

  // getListOtherChildren(context): Observable<any> {
  //   const url = this.getUrl('general', 'list_other_children', context);
  //   return this.getApi(url);
  // }

  // getAccessCashier(context): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'export_access_cashier', context);
  //   return this.getBlobApi(url);
  // }

  // importExcel(body?): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'import_access_cashier');
  //   return this.multipartPost(url, body);
  // }

  // storeAccessCashier(body?): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'store_access_cashier');
  //   return this.postApi(url, body);
  // }
}
