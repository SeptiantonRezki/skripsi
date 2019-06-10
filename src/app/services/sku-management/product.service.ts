import { Injectable } from "@angular/core";
import { BaseService } from "../base.service";
import { HttpClient } from "../../../../node_modules/@angular/common/http";
import { Observable } from "../../../../node_modules/rxjs";

@Injectable()
export class ProductService extends BaseService {
  public namespace = "product";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getdetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", { product_id: id });
    return this.getApi(url);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, "create");
    return this.postApi(url, body);
  }

  put(body, context?): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context);
    return this.postApi(url, body);
  }

  delete(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "delete", context);
    return this.deleteApi(url, context);
  }

  getListCategory(id): Observable<any> {
    const url = this.getUrl(this.namespace, "list_category", { parent_id: id });
    return this.getApi(url);
  }

  getListBrand(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_brand");
    return this.getApi(url);
  }

  getListPackaging(): Observable<any> {
    const url = this.getUrl("general", "list_packaging");
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_other_children", context);
    return this.getApi(url);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent", context);
    return this.getApi(url);
  }
}
