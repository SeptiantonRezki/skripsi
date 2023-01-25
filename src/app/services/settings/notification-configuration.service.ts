import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { Observable } from '../../../../node_modules/rxjs';

@Injectable()
export class NotificationConfigurationService extends BaseService {
  public namespace = 'notification_configuration';
  constructor(http: HttpClient) {
    super(http);
  }

  getSound(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_sound');
    return this.getApi(url, queryParams);
  }
  getStep(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_step');
    return this.getApi(url, queryParams);
  }
  updateSound(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_sound');
    return this.postApi(url, body);
  }
  updateHours(body?, id?): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_hours', {id});
    return this.putApi(url, body);
  }
}
