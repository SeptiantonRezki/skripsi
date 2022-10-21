import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../../node_modules/rxjs';

@Injectable()
export class OrdersService extends BaseService {
  public namespace = "order_rrp";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get");
    return this.getApi(url, queryParams);
  }

  getDetail(id): Observable<any> {
    const url = this.getUrl(this.namespace, "detail", { order_id: id })
    return this.getApi(url);
  }

  putAdjustment(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, "put", context)
    return this.postApi(url, body);
  }

  putStatus(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, "put_status", context)
    return this.postApi(url, body);
  }

  // generateReceipt(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, "html")
  //   return this.postApi(url, body);
  // }

  updatePrice(body): Observable<any> {
    const url = this.getUrl(this.namespace, "update_price")
    return this.postApi(url, body);
  }

  checkUpdatePriceStatus(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "update_price_status", context);
    return this.getApi(url, {});
  }

  courierList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "courier_list");
    return this.getApi(url, queryParams);
  }

  getDetailProductList(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail_product_list", context);
    return this.getApi(url, queryParams);
  }

  export(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "export");
      return this.getBlobAsJsonApi(url, queryParams);
  }
  exportAgentHub(body?) :Observable<any> {
    const url = this.getUrl(this.namespace, "request_export");
    return this.postBlobAsJsonApi(url, body);
  }
  putUpdateableStatus(body: { status?:string } ) {
    const url = this.getUrl(this.namespace, "updateable_status");
    return this.postApi(url, body);
  }
  putUpdateMultipleStatus(body: { is_all?: any, order_id?: Array<any>, status?: string}) {
    const url = this.getUrl(this.namespace, "update_multiple_status");
    return this.postApi(url, body);
  }
  getCoinDiscountHistory(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_coin_discount_history");
    return this.getApi(url, queryParams);
  }
  getCoinDiscountDetail(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_coin_discount_detail", context);
    return this.getApi(url, queryParams);
  }
  getSignMenuOrder(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_sign_order_menu");
    return this.getApi(url, queryParams);
  }
  getRetailerTab(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_tab_retailer");
    return this.getApi(url, queryParams);
  }
  getMitraTab(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_tab_mitra");
    return this.getApi(url, queryParams);
  }
  printMultipleInvoice(body): Observable<any> {
    const url = this.getUrl(this.namespace, "multipleinvoice")
    return this.postApi(url, body);
  }
}

