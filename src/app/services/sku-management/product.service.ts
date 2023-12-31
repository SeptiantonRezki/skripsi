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

  getListCategory(id, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_category", { parent_id: id });
    return this.getApi(url, body);
  }

  getListAllCategory(id, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_all_category");
    return this.getApi(url, body);
  }

  getListCategoryVendor(): Observable<any> {
    const url = this.getUrl(this.namespace, 'list_category_vendor');
    return this.getApi(url);
  }

  getListBrand(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_brand");
    return this.getApi(url);
  }

  getListPackaging(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_packaging");
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

  getProductSkuBank(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "products_sku_bank", { param: queryParams });
    return this.getApi(url);
  }

  export(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
    return this.getApi(url, queryParams);
  }

  exportn(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "export2");
    console.log(url);
    
    return this.postApi(url, queryParams);
  }

  import(context?, body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import");
    return this.multipartPost(url, body)
  }

  getProductBarcodes(context):Observable<any> {
    const url = this.getUrl(this.namespace, "product_barcodes", {param: context.barcode});
    return this.getApi(url)
  }

  generateLink(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "generate_link");
    return this.postApi(url, body);
  }

  getProductCode(context):Observable<any> {
    const url = this.getUrl(this.namespace, "product_code", {param:context.code});
    return this.getApi(url)
  }

}
