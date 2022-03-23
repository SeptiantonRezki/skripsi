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

  putApproval(body): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approval");
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

  putApproval1(body): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approval_1");
    return this.postApi(url, body);
  }

  putApproval2(body): Observable<any> {
    const url = this.getUrl(this.namespace, "put_approval_2");
    return this.postApi(url, body);
  }

  getBarcode(id): Observable<any> {
    const url = this.getUrl(this.namespace, "get_barcode");
    return this.postApi(url, { id: id });
  }

  getCategories(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_categories");
    return this.getApi(url);
  }

  getBrands(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_brands");
    return this.getApi(url);
  }

  getDbCategories(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_db_categories");
    return this.getApi(url);
  }

  getDbApprovers(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_db_approvers");
    return this.getApi(url);
  }

  getDbBrands(): Observable<any> {
    const url = this.getUrl(this.namespace, "get_db_brands");
    return this.getApi(url);
  }
}
