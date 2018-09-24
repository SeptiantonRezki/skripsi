import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable()
export class NavigationService extends BaseService {
  public namespace = 'menu';

  constructor(http: HttpClient) { 
    super(http);
  }

  get(): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url);
  }
}
