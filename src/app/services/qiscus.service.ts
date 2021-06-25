import QiscusSDK from 'qiscus-sdk-core';
import { EventEmitter, Injectable, Output } from '@angular/core';
// import {
//   Router
// } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Emitter } from "../helper/emitter.helper";
import { DialogService } from './dialog.service';
import { BaseService } from "./base.service";
import { environment } from '../../environments/environment';
import { StorageHelper } from 'app/helper/storage.helper';
import { Router } from '@angular/router';

@Injectable()
export class QiscusService extends BaseService {
  DATAUSER: any;
  NEW_MESSAGE: any;
  PRESENCE: any;
  COMMENT_READ: any;
  COMMENT_DELIVERED: any;
  TYPING: any;
  chatIsOpen: boolean;

  @Output() Q_EMITTER: EventEmitter<any> = new EventEmitter();

  constructor(
    http: HttpClient,
    private dialogService: DialogService,
    private emitter: Emitter,
    private storageHelper: StorageHelper,
    private router: Router,
  ) {
    super(http);

    this.DATAUSER = {};
    this.chatIsOpen = false;
    this.emitter.listenChatIsExpandQ.subscribe((value) => {
      this.chatIsOpen = value;
    });
  }

  namespace: any = 'qiscus';

  qiscus = new QiscusSDK();

  initQiscus() {
    const appId = environment.qiscus_appId;
    this.qiscus.init({
      AppId: appId,
      options: {
        loginSuccessCallback: (authData: any) => {
          // console.warn('q_success', authData);
          this.qLoginSuccess(authData);
        },
        loginErrorCallback: (data: any) => {
          // console.warn('q_gagal', data);
          this.qLoginError(data);
        },
        newMessagesCallback: (messages: any) => {
          // console.log('NEW MESSAGES', messages);
          messages.forEach((message: any) => {
            this.emitter.emitNewMessageQ(message);
            const self = this;
            this.NEW_MESSAGE = message;
            this.Q_EMITTER.emit(this.NEW_MESSAGE);
            try {
              if (message.created_at) {
                this.DATAUSER = this.qiscus.userData;
                const notificationTitle = message.username;
                const notificationOptions = {
                  body: message.message,
                  // icon: 'assets/images/ayo/AYO_SRC_(Master).png',
                  // sound: 'https://notificationsounds.com/notification-sounds/light-562/download/mp3'
                };
                if (message.email !== this.DATAUSER.email && !this.chatIsOpen) {
                  if (!("Notification" in window)) {
                    console.log("This browser does not support system notifications");
                  } else if (Notification['permission'] === "granted") {
                    var notification = new Notification(notificationTitle, notificationOptions);
                    notification.onclick = function (event) {
                      event.preventDefault(); // prevent the browser from focusing the Notification's tab
                      console.log(notification, event);
                      self.router.navigate(['/orders', 'detail', message.extras.orderID], {
                        queryParams: { open: true }
                      }
                      );
                      // window.open(payload['notification'].click_action , '_blank');
                      // message.room_id
                      // message.room_id_str
                      // message.extras.invoiceNumber
                      // message.extras.wholesalerName
                      notification.close();
                    }
                  }
                }
              }
            } catch (error) {
              console.log('Unable to Instantiate Messaging ', error);
            }

          });
        },
        presenceCallback: (data: any) => {
          var isOnline = data.split(':')[0] === '1'
          var lastOnline = new Date(Number(data.split(':')[1]))
          this.emitter.emitPresenceQ({
            isOnline: isOnline,
            lastOnline: lastOnline
          });

          this.PRESENCE = {
            isOnline: isOnline,
            lastOnline: lastOnline
          };
          this.Q_EMITTER.emit(this.PRESENCE);
        },
        commentReadCallback: (data: any) => {
          this.emitter.emitReadQ(data);

          this.COMMENT_READ = data;
          this.Q_EMITTER.emit(this.COMMENT_READ);
        },
        commentDeliveredCallback: (data: any) => {
          this.emitter.emitDeliveredQ(data);

          this.COMMENT_DELIVERED = data;
          this.Q_EMITTER.emit(this.COMMENT_DELIVERED);
        },
        typingCallback: (data: any) => {
          this.emitter.emitTypingQ(data);

          this.TYPING = data;
          this.Q_EMITTER.emit(this.TYPING);
        }
      }
    })
  }

  qLoginSuccess = async (data: any) => {
    // console.log('Q_SUCCESS_LOGIN');
    this.storageHelper.setUserQiscus(data);
  };

  qLoginError = (data: any) => {
    // console.log('Q_ERROR_LOGIN');
    try {
      const tempData = JSON.parse(data);
      this.dialogService.openSnackBar({ message: tempData.error.message });
    } catch (e) {
      this.dialogService.openSnackBar({ message: 'Server Error' });
    }
  };

  qiscusUpdateRoomId(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "updateRoomIdTransaksi", body);
    return this.postApi(url, body.roomId);
  }

  qiscusCreateUpdateRoom(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "createUpdateRoomOrder");
    return this.postApi(url, body);
  }

  qiscusCreateUpdateRoomId(context): Observable<any> {
    const url = this.getUrl(this.namespace, "createUpdateRoomOrderId", context);
    return this.getApi(url);
  }

  qiscusCreateUpdateRoomOrderPL(context): Observable<any> {
    const url = this.getUrl(this.namespace, "createUpdateRoomOrderPL", context);
    return this.getApi(url);
  }

  getMessageTemplates(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getMessageTemplates", context);
    return this.getApi(url);
  }
  
  createJWT(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'createJWT');
    return this.postApi(url, body);
  }
  /**
   *  ============================= QISCUS MULTICHANNEL ==============================
   *  
   * */

  qiscusMC = new QiscusSDK();

  initQiscusMC() {
    const appIdMC = environment.qiscus_appIdMC;

    this.qiscusMC.init({
      AppId: appIdMC,
      options: {
        loginSuccessCallback: (authData: any) => {
          // console.warn('q_success', authData);
          this.qLoginSuccessMC(authData);
        },
        loginErrorCallback: (data: any) => {
          // console.warn('q_gagal', data);
          this.qLoginErrorMC(data);
        },
        newMessagesCallback: (messages: any) => {
          // console.log('NEW MESSAGES', messages);
          messages.forEach((message: any) => {
            this.emitter.emitNewMessageQMC(message);
            // const self = this;
            // try {
            //   if(message.created_at){
            //     this.DATAUSER = this.qiscus.userData;
            //     const notificationTitle = message.username;
            //     const notificationOptions = {
            //       body: message.message,
            //     };
            //     if(message.email !== this.DATAUSER.email && !this.chatIsOpen) {
            //       if (!("Notification" in window)) {
            //         console.log("This browser does not support system notifications");
            //       } else if (Notification['permission'] === "granted") {
            //         var notification = new Notification(notificationTitle, notificationOptions);
            //         notification.onclick = function (event) {
            //           event.preventDefault(); // prevent the browser from focusing the Notification's tab
            //           console.log(notification, event);
            //           self.router.navigate(['/orders', 'detail', message.extras.orderID], {
            //             queryParams: { open: true }
            //            }
            //           );
            //           notification.close();
            //         }
            //       }
            //     }
            //   }
            // } catch (error) {
            //   console.log('Unable to Instantiate Messaging ', error);
            // }
          });
        },
        presenceCallback: (data: any) => {
          var isOnline = data.split(':')[0] === '1'
          var lastOnline = new Date(Number(data.split(':')[1]))
          this.emitter.emitPresenceQMC({
            isOnline: isOnline,
            lastOnline: lastOnline
          });
        },
        commentReadCallback: (data: any) => {
          this.emitter.emitReadQMC(data);
        },
        commentDeliveredCallback: (data: any) => {
          this.emitter.emitDeliveredQMC(data);

        },
        typingCallback: (data: any) => {
          this.emitter.emitTypingQMC(data);
        }
      }
    })
  }

  qLoginSuccessMC = async (data: any) => {
    // console.log('SUCCESS_LOGIN');
  };

  qLoginErrorMC = (data: any) => {
    console.log('ERROR_LOGIN');
    try {
      const tempData = JSON.parse(data);
      this.dialogService.openSnackBar({ message: tempData.error.message });
    } catch (e) {
      this.dialogService.openSnackBar({ message: 'Server Error' });
    }
  };

  qiscusLoginMultichannel(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "loginMultichannel");
    return this.postApi(url, body);
  }

  qiscusCreateRoomMultichannel(body: any): Observable<any> {
    const url = this.getUrl(this.namespace, "createRoomMultichannel");
    return this.postApi(url, body);
  }

  createJWTMC(body?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'createJWTMC');
    return this.postApi(url, body);
  }

}
