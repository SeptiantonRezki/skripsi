import { Injectable } from "@angular/core";
import { BaseService } from "../../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class OrdertoSupplierService extends BaseService {
  public namespace = "PLOrdertoSupplier";

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getList");
    return this.getApi(url, queryParams);
  }

  detail(context?: any, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", context);
    return this.getApi(url, queryParams);
  }

  create(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  update(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "update", context);
    return this.postApi(url, body);
  }

  updateStatus(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "updateStatus", context);
    return this.postApi(url, body);
  }

  delete(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  getListCategory(): Observable<any> {
    const url = this.getUrl(this.namespace, "listCategory");
    return this.getApi(url);
  }

  getFilterProduct(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "filterProduct", context);
    return this.getApi(url);
  }

  showListPesanan(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "showListPesanan", context);
    return this.getApi(url);
  }

  putStatusPesanan(body, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "statusPesanan", context);
    return this.postApi(url, body);
  }

  exportPO(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "exportPO");
    return this.getBlobAsJsonApi(url, queryParams);
  }

  updateQty(body, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "updateQty", context);
    return this.putApi(url, body);
  }

  getDocuments(body): Observable<any> {
    const url = this.getUrl(this.namespace, "dokumen_list");
    return this.postApi(url, body);
  }

}
