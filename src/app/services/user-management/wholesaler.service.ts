import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class WholesalerService extends BaseService {
  public namespace = "wholesaler";

  /** ADD MORE ADJUSTABLE PAGE WHOLESALER->INDEX */
  sharedComponent = false;


  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?, body?): Observable<any> {
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

  exportWholesalerNew(queryParams?,context?): Observable<any> {
    const url = this.getUrl(this.namespace, "exportWholesaller", context);
    return this.getBlobApi(url, queryParams);
  }
  
  importExcel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_preview");
    return this.multipartPost(url, body);
  }
  
  storeImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store_import");
    return this.postApi(url, body);
  }
  getWsRoles(): Observable<any> {
    const url = this.getUrl(this.namespace, "roles");
    return this.getApi(url);
  }

  showKtp(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_ktp");
    return this.postBlobAsJsonApi(url, body);
  }

  showNpwp(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_npwp");
    return this.postBlobAsJsonApi(url, body);
  }

  showDocumentOrder(body): Observable<any> {
    const url = this.getUrl(this.namespace, "show_document_order");
    return this.postBlobAsJsonApi(url, body);
  }


}
