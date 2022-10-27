import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../node_modules/rxjs';

@Injectable()
export class KeywordService extends BaseService {
  public namespace = 'keyword';

  constructor(http: HttpClient) {
    super(http);
  }

  getKeywordList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  put(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'put', context);
    return this.postApi(url, body);
  }

  importExcel(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'importKeyword');
    return this.postApi(url, body);
  }
  showImport(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'previewImportKeyword');
    return this.getApi(url, queryParams);
  }

  exportKeyword(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'exportKeyword');
    return this.postApi(url, body);
  }

}
