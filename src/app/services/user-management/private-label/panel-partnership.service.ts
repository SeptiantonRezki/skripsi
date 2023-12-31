import { Injectable } from "@angular/core";
import { BaseService } from "../../base.service";
import { HttpClient } from "../../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../../node_modules/rxjs";

@Injectable({
  providedIn: 'root'
})
export class PanelPartnershipService extends BaseService {
  public namespace = "panel_partnership";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  update(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.putApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getListSuppliers(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_suppliers");
    return this.getApi(url, queryParams);
  }

  updateStatus(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "updateStatus", context);
    return this.postApi(url, body);
  }

  importExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, "import");
    return this.postApi(url, body);
  }

  showImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "show_import");
    return this.getApi(url, queryParams);
  }

  exportExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.postApi(url, body);
  }

  // getListAudience(): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'list_scheduler');
  //   return this.getApi(url);
  // }

  // getListRetailer(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'list_retailer');
  //   return this.getApi(url, queryParams);
  // }

  // getListRetailerSelected(context, queryParams): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'detail', context);
  //   return this.getApi(url, queryParams);
  // }

  getListRetailerIdSelected(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_retailer_selected', context);
    return this.getApi(url);
  }

  // getListLevel(): Observable<any> {
  //   const url = this.getUrl(this.namespace, "list_level");
  //   return this.getApi(url);
  // }

  // getListChildren(context): Observable<any> {
  //   const url = this.getUrl(this.namespace, "list_children", context);
  //   return this.getApi(url);
  // }

  // getListOtherChildren(context): Observable<any> {
  //   const url = this.getUrl(this.namespace, "list_other_children", context);
  //   return this.getApi(url);
  // }

  // importExcel(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, "import");
  //   return this.postApi(url, body);
  // }

  // showImport(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "show_import");
  //   return this.getApi(url, queryParams);
  // }

  // exportExcel(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, "export");
  //   return this.postApi(url, body);
  // }


}
