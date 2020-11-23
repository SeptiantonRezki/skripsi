import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class WholesalerService extends BaseService {
  public namespace = "wholesaler";

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

  create(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.putApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url);
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

  getBusinessDetail(context?): Observable<any> {
    const url = this.getUrl("general", "get_business", context);
    return this.getApi(url);
  }

  exportWholesaler(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "export", context);
    return this.getBlobApi(url);
  }

  exportWholesalerlist(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "exportWhosaller", context);
    return this.getBlobApi(url);
  }
  
  importExcel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_preview");
    return this.multipartPost(url, body);
  }
  
  storeImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store_import");
    return this.postApi(url, body);
  }
}
