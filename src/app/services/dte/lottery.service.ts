import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class LotteryService extends BaseService {

  public namespace = "lottery";

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

  put(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
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

  // getListRetailerIdSelected(context): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'list_retailer_selected', context);
  //   return this.getApi(url);
  // }

  // validateBudget(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'validate_budget');
  //   return this.postApi(url, body);
  // }

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
  // requestPreviewImportExcel(body?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "request_preview_import");
  //   return this.postApi(url, body);
  // }
  
  // showPreviewImport(body?, queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "show_preview_import");
  //   return this.postApi(url, body, queryParams);
  // }
  // requestImportExcel(body?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "request_import");
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

  // getListTradePrograms(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "list_trade_program");
  //   return this.getApi(url, queryParams);
  // }

  // getListScheduler(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "list_scheduler");
  //   return this.getApi(url, queryParams);
  // }

  // showStatusImport(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "show_status");
  //   return this.getApi(url, queryParams);
  // }
  
  // // Personalize
  // getPersonalize(queryParams?): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'get_post_personalize');
  //   return this.getApi(url, queryParams);
  // }

  // createPersonalize(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'get_post_personalize');
  //   return this.postApi(url, body);
  // }

  // putPersonalize(body, context): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'put_personalize', context);
  //   return this.postApi(url, body);
  // }

  // checkAudience(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'check_audience');
  //   return this.postApi(url, body);
  // }

  // previewAudience(body): Observable<any> {
  //   const url = this.getUrl(this.namespace, 'preview_audience');
  //   return this.postApi(url, body);
  // }

  // exportPreviewAudience(body?): Observable<any> {
  //   const url = this.getUrl(this.namespace, "export_preview_audience");
  //   return this.postBlobApi(url, body);
  // }
}
