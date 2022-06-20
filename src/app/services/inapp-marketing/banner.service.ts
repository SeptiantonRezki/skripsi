import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class BannerService extends BaseService {
  public namespace = "banner";
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent", context);
    return this.getApi(url);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl("general", "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_other_children", context);
    return this.getApi(url);
  }

  getListWallet(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_wallet");
    return this.getApi(url);
  }

  getAudience(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_audience");
    return this.getApi(url, queryParams);
  }

  exportAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_audience");
    return this.postBlobApi(url, body);
  }

  importAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_audience");
    return this.postApi(url, body);
  }

  getCustomerAudience(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_c_audience");
    return this.getApi(url, queryParams);
  }

  exportCustomerAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_c_audience");
    return this.postBlobApi(url, body);
  }

  importCustomerAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_c_audience");
    return this.postApi(url, body);
  }
  updateSorting(body): Observable<any> {
    const url = this.getUrl(this.namespace, "update_sorting");
    return this.postApi(url, body);
  }
  getSorting(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_sorting");
    return this.getApi(url, queryParams);
  }
  getListBannerCustomer(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_banner_customer");
    return this.getApi(url);
  }
}
