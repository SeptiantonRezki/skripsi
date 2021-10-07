import { Injectable } from '@angular/core';
import { BaseService } from "../base.service";
import { HttpClient } from "../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class ProductSubmissionService extends BaseService {
  public namespace = "product_submission";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "get_detail", { product_id: id });
    return this.getApi(url);
  }

  putApprove(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approve", context);
    return this.postApi(url, body);
  }

  putDisapprove(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_disapprove", context);
    return this.postApi(url, body);
  }

  getDb(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_db");
    return this.getApi(url, queryParams);
  }

  getDbDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "get_db_detail", { product_id: id });
    return this.getApi(url);
  }

  getUser(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_user");
    return this.getApi(url);
  }

  putUser(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_user", context);
    return this.postApi(url, body);
  }

  putApprove1(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approve_1", context);
    return this.postApi(url, body);
  }

  putDisapprove1(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_disapprove_1", context);
    return this.postApi(url, body);
  }

  putApproveDbProduct(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approve_db_product", context);
    return this.postApi(url, body);
  }

  putDisapproveDbProduct(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_disapprove_db_product", context);
    return this.postApi(url, body);
  }

  getBarcode(id): Observable<any> {
    const url = this.getUrl(this.namespace, "get_barcode", { product_id: id });
    return this.getApi(url);
  }
}
