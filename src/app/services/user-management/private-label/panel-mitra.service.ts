import { Injectable } from "@angular/core";
import { BaseService } from "../../base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class PanelMitraService extends BaseService {
  public namespace = "PLSupplierPanelMitra";

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getList");
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

  getListCategory(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "listCategory");
    return this.getApi(url, queryParams);
  }

  getFilterProduct(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "filterProduct", context);
    return this.getApi(url);
  }

  getListMitra(queryParams?: any, body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getListMitra", context);
    return this.postApi(url, body, queryParams);
  }
  
  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_other_children", context);
    return this.getApi(url);
  }

  getFilterSupplier(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "filterSupplier", context);
    return this.getApi(url);
  }

  importMitra(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "importMitra");
    return this.postApi(url, body);
  }

  exportMitra(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "exportMitra");
    return this.postBlobAsJsonApi(url, body);
  }

  previewImportMitra(): Observable<any> {
    const url = this.getUrl(this.namespace, "previewImportMitra");
    return this.getApi(url);
  }

  checkPanelMitra(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "checkPanelMitra");
    return this.postApi(url, body);
  }

}
