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
}
