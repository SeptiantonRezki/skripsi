import { Injectable } from '@angular/core';
import { BaseService } from "../base.service";
import { HttpClient } from "../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class ProductCashierService extends BaseService {
  public namespace = "product_cashier";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  barcode(id): Observable<any> {
    const url = this.getUrl(this.namespace, "barcode", { product_id: id });
    return this.getApi(url);
  }

  getdetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", { product_id: id });
    return this.getApi(url);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }
}
