import QiscusSDK from 'qiscus-sdk-core';
import { Injectable } from '@angular/core';
// import {
//   Router
// } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Emitter } from "../helper/emitter.helper";
import { DialogService } from './dialog.service';
import { BaseService } from "./base.service";
import { environment } from '../../environments/environment';

@Injectable()
export class QiscusService extends BaseService {
  DATAUSER: any;

  constructor(
    http: HttpClient,
    private dialogService: DialogService,
    private emitter: Emitter,
  ) {
    super(http);
    
    this.DATAUSER = {};
  }

  namespace: any = 'qiscus';
  /**
   *  ============================= QISCUS MULTICHANNEL ==============================
   *  
   * */ 

  qiscusMC = new QiscusSDK();

  initQiscusMC(){
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
    console.log('SUCCESS_LOGIN');
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
}
