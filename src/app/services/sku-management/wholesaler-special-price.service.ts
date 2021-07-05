import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "../../../../node_modules/rxjs";
import { WholesalerService } from "../user-management/wholesaler.service";

@Injectable()
export class WholesalerSpecialPriceService extends WholesalerService {
  public namespace = "wholesaler_special_price";

  _fetching = new BehaviorSubject(false);

  /** ADD MORE ADJUSTABLE PAGE WHOLESALER->INDEX */

  constructor(http: HttpClient) {
    super(http);
  }

  fetching() {
    return this._fetching.asObservable();
  }
  get(queryParams?, body?): Observable<any> {
    this._fetching.next(true);
    const url = this.getUrl(this.namespace, "get");
    return this.postApi(url, body, queryParams).map(res => res['data']).finally(() => {
      this._fetching.next(false);
    });
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

  exportWholesalerlist(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "exportWholesaller");
    return this.postBlobApi(url, body);
  }
  
  importExcel(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "store_import");
    return this.multipartPost(url, body);
  }
  importPreview(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_preview");
    return this.postApi(url, body);
  }
  
  storeImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_preview");
    return this.postApi(url, body);
  }
  getWsRoles(): Observable<any> {
    const url = this.getUrl(this.namespace, "roles");
    return this.getApi(url);
  }


}
