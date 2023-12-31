import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class RetailerService extends BaseService {
  public namespace = "retailer";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url);
  }

  show_v2(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "show_v2", context);
    return this.getApi(url);
  }

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.putApi(url, body);
  }

  put_v2(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put_v2", context);
    return this.putApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
  }

  getConsumerList(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "consumer_list", context);
    return this.getApi(url);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent_by_code", context);
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

  getAccessCashier(body): Observable<any> {
    const url = this.getUrl(this.namespace, "export_access_cashier");
    return this.postApiTest(url, body);
  }

  getIdNumber(body): Observable<any> {
    const url = this.getUrl(this.namespace, "export_id_number");
    return this.postApiTest(url, body);
  }

  requestExportCashier(body): Observable<any> {
    const url = this.getUrl(this.namespace, "request_export_cashier");
    return this.postApi(url, body);
  }

  statusExportCashier(body): Observable<any> {
    const url = this.getUrl(this.namespace, "status_export_cashier");
    return this.postApi(url, body);
  }

  importExcel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_access_cashier");
    return this.multipartPost(url, body);
  }

  storeAccessCashier(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store_access_cashier");
    return this.postApi(url, body);
  }

  exportBankAccount(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_bank_account");
    return this.getBlobAsJsonApi(url, body);
  }
}
