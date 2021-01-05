import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationListService extends BaseService {
  public namespace = 'notifications_list';

  getListUpdate(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_update');
    return this.getApi(url, queryParams);
  }

  updateBadge(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_badge');
    return this.postApi(url, body);
  }

  unreadBadge(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'unread_badge');
    return this.postApi(url, body);
  }

  deleteBadge(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_notif');
    return this.postApi(url, body);
  }

  getDetail(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_detail', context);
    return this.getApi(url);
  }
}
