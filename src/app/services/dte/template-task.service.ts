import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateTaskService extends BaseService {
  public namespace = "template_task"

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

  uploadVideo(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'upload_video');
    return this.postApi(url, body);
  }

  getStockCheckIRTemplates(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'stock_check_ir');
    return this.getApi(url, queryParams);
  }

  getPlanogramIRTemplates(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'planogram_ir');
    return this.getApi(url, queryParams);
  }
}
