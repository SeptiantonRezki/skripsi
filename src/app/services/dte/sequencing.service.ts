import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})

export class SequencingService extends BaseService {

  public namespace = "sequencing";

  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context): Observable<any> {
    const url = this.getUrl(this.namespace, "show", context);
    return this.getApi(url);
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

  getListTradePrograms(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_trade_program");
    return this.getApi(url, queryParams);
  }

  getListTradeAudienceGroup(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "list_trade_audience__group");
    return this.getApi(url, queryParams);
  }

  checkBudget(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'check_budget');
    return this.postApi(url, body);
  }

  getPopup(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_popup');
    return this.getApi(url, queryParams);
  }

  getPush(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_push');
    return this.getApi(url, queryParams);
  }

  export(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.postApi(url, body);
  }

  updateStatus(context, body): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_status', context);
    return this.postApi(url, body);
  }

  downloadAdjustmentCoin(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'download_adjustment');
    return this.postApi(url, body);
  }

  previewAdjustmentCoin(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'preview_adjustment');
    return this.postApi(url, body);
  }

  importAdjustmentCoin(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'import_adjustment');
    return this.postApi(url, body);
  }

  adjustRetailerCoin(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'adjust_retailer');
    return this.postApi(url, body);
  }

  getImportPreviewAdjustmentCoin(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_import_preview_adjustment');
    return this.postApi(url, body);
  }

  downloadEncryption(body?): Observable<any> {
    const url = this.getUrl(this.namespace, 'download_encryption');
    return this.postBlobApi(url, body);
  }

  // Personalize
  getPersonalize(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_post_personalize');
    return this.getApi(url, queryParams);
  }

  deletePersonalize(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_delete_personalize', context);
    return this.deleteApi(url);
  }
}