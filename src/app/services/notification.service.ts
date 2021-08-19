

import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs'
import { DataService } from './data.service';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';

import { mergeMapTo } from 'rxjs/operators';
import { Emitter } from 'app/helper/emitter.helper';

@Injectable()
export class NotificationService extends BaseService {
  public namespace = 'notification';

  public messaging: firebase.messaging.Messaging;
  currentMessage = new BehaviorSubject(null);

  constructor(
    http: HttpClient,
    private afDb: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private dataService: DataService,
    private emitter: Emitter,
    private angularFireMessaging: AngularFireMessaging) {
    super(http);
    try {
      this.angularFireMessaging.messaging.subscribe((_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      })
    } catch (e) {
      console.log('Unable to Instantiate Firebase Messaing', e);
    }
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create');
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  show(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl("general", "parent", context);
    return this.getApi(url);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl("general", "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl("general", "list_other_children", context);
    return this.getApi(url);
  }

  getPopup(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_popup');
    return this.getApi(url, queryParams);
  }

  getById(queryParams?, context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show_popup', context);
    return this.getApi(url, queryParams);
  }

  createPopup(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_popup');
    return this.postApi(url, body);
  }

  updatePopup(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'update_popup', context);
    return this.postApi(url, body);
  }

  deletePopup(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_popup', context);
    return this.deleteApi(url);
  }

  getPopupAudience(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_audience");
    return this.getApi(url, queryParams);
  }

  exportAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_audience");
    return this.postBlobApi(url, body);
  }

  importAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_audience");
    return this.postApi(url, body);
  }

  getPushNotifAudienceIDs(queryParams?): Observable<any> {
    let url = this.getUrl(this.namespace, "get_pn_audience_ids");
    return this.getApi(url, queryParams);
  }

  getPushNotifAudience(queryParams?): Observable<any> {
    let url = this.getUrl(this.namespace, "get_pn_audience");
    return this.getApi(url, queryParams);
  }

  exportPushNotifAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "export_pn_audience");
    return this.postBlobApi(url, body);
  }

  importPushNotifAudience(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "import_pn_audience");
    return this.postApi(url, body);
  }

  previewImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "preview_import");
    return this.postApi(url, body);
  }
  exportCustom(body?): Observable<any> {    
    const url = this.getUrl(this.namespace, "export_custom");
    return this.postBlobApi(url, body);
  }  
  createCustom(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_custom');
    return this.postApi(url, body);
  }
  showCustom(context?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show_custom', context);
    return this.getApi(url);
  }
  /**
   * update token in firebase database
   * 
   * @param userId userId as a key 
   * @param token token as a value
   */
  updateToken(userId, token) {
    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (!user) return;

      const data = { [user.uid]: token }
      this.afDb.object('fcmTokens/').update(data)
    })
  }

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermissions(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      async (token) => {
        const profile = await this.dataService.getDecryptedProfile();
        let userToken = {};
        if (profile) {
          console.warn('1');
          userToken = {
            user_id: profile.id,
            role_id: profile.role_id,
            token: token
          };
          this.sendTokenToServer(userToken);
          this.updateToken(userId, token);
        } else {
          console.warn('0');
          setTimeout(() => {
            this.requestPermissions(userId);
          }, 1000);
        }
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  /**
   * hook method when new notification received
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe((payload) => {
      this.currentMessage.next(payload);

      const notificationTitle = payload['notification'].title;
      const notificationOptions = {
        body: payload['notification'].body,
      };
      this.emitter.emitNotifDetailEmitter({ isUpdateNotif: true });
      const self = this;
      if (!("Notification" in window)) {
        console.log("This browser does not support system notifications");
      } else if (Notification['permission'] === "granted") {
        setTimeout(() => {
          const notification = new Notification(notificationTitle, notificationOptions);
          notification.onclick = function (event) {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            // window.open(payload['notification'].click_action , '_blank');
            console.log('NOTIFICATION POPUP', event);
            notification.close();
            self.emitter.emitNotifDetailEmitter({ isNotifOnCLick: true });
          };
        }, 1000);
      }
    });
  }

  sendTokenToServer(currentToken) {
    // if (!this.isTokenSentToServer()) {
      console.warn('Sending token to server...');
      // TODO(developer): Send the current token to your server.

      if (currentToken) {
        this.setToken(currentToken).subscribe(res => res);
        this.setTokenSentToServer(true);
      }
    // } else {
    //   console.log('Token already sent to server so won\'t send it again unless it changes');
    // }
  }

  getListNotif(queryParams?: any): Observable<any> {
    const url = this.getUrl('notif', 'list_notif');
    return this.getApi(url, queryParams);
  }

  updateNotif(id): Observable<any> {
    const url = this.getUrl('notif', 'update', { id_notif: id });
    return this.putApi(url, {});
  }

  isTokenSentToServer() {
    return this.dataService.getFromStorage('sentToServer') === 1;
  }

  setTokenSentToServer(sent: Boolean) {
    this.dataService.setToStorage('sentToServer', sent ? 1 : 0)
  }

  setToken(body?): Observable<any> {
    const url = this.getUrl('authentication', 'fcm_token');
    return this.postApi(url, body);
  }

  getPopupNotif(): Observable<any> {
    const url = this.getUrl('notif', 'popup');
    return this.getApi(url);
  }

  sendPopupNotif(body?): Observable<any> {
    const url = this.getUrl('notif', 'update_notif');
    return this.postApi(url, body);
  }
  getPageContent(slug): Observable<any> {
    const url = this.getUrl('notif', 'content', {slug});
    return this.getApi(url);
  }
}
