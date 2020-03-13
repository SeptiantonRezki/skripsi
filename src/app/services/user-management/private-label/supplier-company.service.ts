import { Injectable } from "@angular/core";
import { BaseService } from "../../base.service";
import { HttpClient } from "../../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../../node_modules/rxjs";

@Injectable()
export class SupplierCompanyService extends BaseService {
  public namespace = "PLSupplierCompany";

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getList");
    return this.getApi(url, queryParams);
  }

  getListByProductId(context?: any, queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getListByProductId", context);
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

  search(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "search", context);
    return this.getApi(url);
  }
}
