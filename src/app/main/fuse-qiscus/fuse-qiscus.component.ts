import {
  Component,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import * as moment from 'moment';
import {
  Emitter
} from 'app/helper/emitter.helper';
import {
  QiscusService
} from 'app/services/qiscus.service';
import {
  DataService
} from 'app/services/data.service';
import {
  StorageHelper
} from 'app/helper/storage.helper';
import { DialogService } from 'app/services/dialog.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { FormGroup, FormArray } from "@angular/forms";

import { UploadImageQiscusComponent } from "./upload-image-qiscus/upload-image-qiscus.component";

const screenWidth = window.innerWidth;

@Component({
  selector: 'fuse-chat',
  templateUrl: './fuse-qiscus.component.html',
  styleUrls: ['./fuse-qiscus.component.scss'],
  animations: [
    trigger('expandChat', [
      state('initial', style({
        bottom: screenWidth > 490 ? 'calc(-80% + 78px)' : 'calc(-80% + 78px)',
      })),
      state('final', style({
        bottom: 0,
      })),
      transition('initial=>final', animate('250ms ease-in')),
      transition('final=>initial', animate('100ms ease-out')),
    ]),
    trigger('expandReplied', [
      state('initial', style({
        bottom: '0',
        position: 'relative'
      })),
      state('final', style({
        bottom: '-250px',
        position: 'absolute'
      })),
      transition('initial=>final', animate('150ms ease-in')),
      transition('final=>initial', animate('100ms ease-out')),
    ]),
  ],
})
export class FuseQiscusComponent {
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;
  isExpand: boolean = true; //untuk kondisi menampilkan chat layer jika true
  expandState: any = 'initial'; //untuk animasi collapsible chat layer ketika expand and collapse

  isExpandReplied: boolean = false; //untuk kondisi menampilkan replied layout jika true
  expandStateReplied: any = 'final'; //untuk animasi collapsible replied layout ketika expand and collapse

  messageIndexHover: number; //untuk menandakan class DOM per message-container, untuk merender button reply

  dataChat: any; // data Chat Qiscus/comments
  dataQiscus: any;
  dataTransaction: any; // data transaksi dan dataQiscus
  chatIsOver: boolean; // digunakan untuk menandakan pesan telah berakhir berdasarkan status transaksi
  message: any;
  userProfile: any;
  userQiscus: any;
  messageOption: boolean;
  dataReplied: any;
  pendingMessage: boolean;
  lastMessageId: any;
  state_: any;
  isReply: boolean;
  templates: any; // message Templates
  templateTaskForm: FormGroup;
  dialogRef: any;


  constructor(
    private emitter: Emitter,
    private qs: QiscusService,
    private dataService: DataService,
    private storageHelper: StorageHelper,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.dataChat = [];
    this.dataQiscus = null;
    this.dataTransaction = null;
    this.chatIsOver = false;
    this.message = null;
    this.userProfile = null;
    this.userQiscus = null;
    this.messageOption = false;
    this.dataReplied = {
      replyId: "",
      replyEmailUser: "",
      replyNameUser: "",
      replyMessage: "",
      replyUriImage: "",
      replyPayload: {}
    };
    this.pendingMessage = false;
    this.lastMessageId = null;
    this.state_ = {
      isLoadMore: false
    }
    this.isReply = false;
    this.messageIndexHover = -1;
    this.templates = [];

    this.emitter.listenDataChatQ.subscribe((data: any) => {
      if (data) {
        if (data.dataQiscus) {
          // console.log("DATA_Q1", data);
          // this.lastMessageId = data.dataQiscus.comments[data.dataQiscus.comments.length - 1].id;
          // localStorage.setItem('dataQiscus', JSON.stringify(data.dataQiscus))
          if (data.templates) {
            this.templates = data.templates;
          }
          this.dataChat = data.dataQiscus.comments.reverse();
          this.dataQiscus = data.dataQiscus;
          localStorage.removeItem('dataQiscus');
        } else {
          // if (localStorage.getItem('dataQiscus')) {
          //   let q = JSON.parse(localStorage.getItem('dataQiscus'));
          // console.log("DATA_Q2", data);
          //   this.dataChat = q.comments;
          //   this.dataQiscus = q;
          // }
          if (data.templates) {
            this.templates = data.templates;
          }
          if (this.dataTransaction) {
            this._loadRoom(this.dataTransaction.qiscus_room_id);
          }
        }
        // console.log('this.dataTransaction', data);
        this.dataTransaction = data;
        if (data.status) {
          if (data.status == "selesai" || data.status == "pesanan-dibatalkan") {
            this.chatIsOver = true;
            // this.dataChat = [];
          }
        }
      }
      // console.log("this.dataChat", this.dataChat);
    });

    this.emitter.listenNewMessageQ.subscribe((data: any) => {
      // console.log('listenNewMessageQ', data);
      this._onNewMessage(data);
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
    });

    this.emitter.listenChatAutoOpenQ.subscribe((value) => {
      if (value) {
        this.expandChat();
      }
    });

    // this.qs.Q_EMITTER.subscribe((res: any) => {
    //   console.log('Q_EMITTER', res);
    //   if (res['NEW_MESSAGE']) {
    //     console.log('NEW_MESSAGESUBSCRIBE', res['NEW_MESSAGE']);
    //   }
    // });
  }

  async ngOnInit() {

    if (this.dataTransaction) {
      if (this.router.url.search('/src-catalogue/orders/detail/' + this.dataTransaction.id) == -1) {
        this.emitter.emitChatIsOpen(false);
      } else {
        if (this.router.url.search('/src-catalogue/orders/detail/') == -1) {
          this.emitter.emitChatIsOpen(false);
        }
      }
    } else {
      if (this.router.url.search('/src-catalogue/orders/detail/') == -1) {
        this.emitter.emitChatIsOpen(false);
      }
    }
    if (this.dataQiscus == null) {
      if (this.dataTransaction) {
        this._loadRoom(this.dataTransaction.qiscus_room_id);
      }
    }
    // this.userProfile = await this.dataService.getFromStorage('profile');
    this.userProfile = await this.dataService.getDecryptedProfile();
    this.userQiscus = await this.storageHelper.getUserQiscus();
    this.scrollToBottom();
  }

  expandChat() {
    this.expandState = this.expandState === 'initial' ? 'final' : 'initial';
    if (this.isExpand) {
      this.emitter.emitChatIsExpand(true);
      return this.isExpand = false;
    }
    this.emitter.emitChatIsExpand(false);
    this.scrollToBottom();
    return this.isExpand = true;
  }

  expandReplied() {
    this.expandStateReplied = this.expandStateReplied === 'initial' ? 'final' : 'initial';
    if (this.isExpandReplied) {
      this.isReply = false;
      this.dataReplied = {};
      return this.isExpandReplied = false;
    }
    this.scrollToBottom();
    return this.isExpandReplied = true;
  }

  messageOnHover(index: number) {
    this.messageIndexHover = index;
    return;
  }

  scrollToBottom(): void {
    try {
      console.log('myScrollContainer', this.myScrollContainer);
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log('Scrolling Error', err);
    }
  }

  @HostListener('scroll', ['$event']) onScroll($event: Event): void {
    const target = $event.srcElement as HTMLTextAreaElement;
    if (target.scrollTop == 0 && !this.state_.isLoadMore) {
      this.state_.isLoadMore = false;
      if (this.dataChat !== null) {
        if (this.dataChat.length > 0) {
          this.lastMessageId = this.dataChat[0].id;
          this.loadMore();
        }
      }
    }
  }

  //------------------------------FUNCTION ---------------------------------

  loadMore() {
    this.state_.isLoadMore = true;
    let options = {
      limit: 20
    };
    // let el = document.getElementById(this.dataChat[0].id);
    this.qs.qiscus.loadMore(this.lastMessageId, options)
      .then((res: any) => {
        if (res.length > 0) {
          // console.log("new Loadmore..", res);
          let last = res.map((d: any) => { return this.renderMessageOnLoadMore(d) });
          // this.lastMessageId = res[0].id;
          // console.log("Loadmore..", last);
          Promise.all(last).then(() => this.dataChat.unshift(...last));
          this.state_.isLoadMore = false;
          // el.scrollIntoView();
        } else {
          console.log("Tidak ada hasil..", res);
          this.state_.isLoadMore = false;
        }
      }, (err: any) => {
        console.log("Error load more", err);
        this.state_.isLoadMore = false;
        throw new Error(err);
      });
  }

  renderMessageOnLoadMore(data: any) {
    const temp = {
      attachment: null,
      avatar: data.user_avatar.avatar ? data.user_avatar.avatar.url : data.user_avatar,
      before_id: data.comment_before_id,
      date: data.timestamp,
      id: data.id,
      isDelivered: true,
      isFailed: false,
      isPending: false,
      isRead: data.status == 'read' ? true : false,
      isSent: true,
      is_deleted: false,
      message: data.message,
      payload: data.payload,
      status: 'read',
      subtype: null,
      time: moment(data.timestamp).format('HH:mm'),
      timestamp: data.timestamp,
      type: 'text',
      unique_id: data.unique_temp_id,
      username_as: data.username,
      username_real: data.email
    };
    return temp;
  }

  onMessageSameName(email: any, i: number) {
    if (i !== 0) {
      if (email !== this.dataChat[i - 1].username_real) {
        return true;
      }
      if (this.onDateFilter(this.dataChat[i].timestamp, i)) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  }

  onDateFilter(lastTime: any, i: number) {
    if (i !== 0) {
      let lt = String(moment(lastTime).format('dddd, DD MMMM YYYY'));
      let pt = String(moment(this.dataChat[i - 1].timestamp).format('dddd, DD MMMM YYYY'));
      if (lt !== pt) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  }

  isDateToday(date: any) {
    let d = String(moment(date).format('dddd, DD MMMM YYYY'));
    let t = String(moment(new Date()).format('dddd, DD MMMM YYYY'));
    if (d === t) {
      return true;
    }
    return false;
  }

  dateLive(date: any) {
    return String(moment(date).format('dddd, DD MMMM YYYY'));
  }

  _loadRoom(roomId: any) {
    if (roomId !== null) {
      this.qs.qiscus.getRoomById(roomId).then((data: any) => {
        // console.log('GETROOMID', data);
        this.dataQiscus = data;
        // localStorage.setItem('dataQiscus', JSON.stringify(data));
        try {
          // const reversedData = data.comments.length > 0 ? [...data.comments].reverse() : [];
          const reversedData = data.comments.length > 0 ? [...data.comments] : [];
          const arrayFilter = [];
          const arrayDuplicate = [];
          for (let i = 0; i < reversedData.length; i++) {
            let isDuplicate = false;
            for (let j = 0; j < reversedData.length; j++) {
              if (i !== j && i > j) {
                if (reversedData[i].unique_id === reversedData[j].unique_id) {
                  isDuplicate = true;
                }
              }
            }
            if (!isDuplicate) {
              const index = arrayDuplicate.map((val) => { return val.unique_id; }).indexOf(reversedData[i].unique_id);
              if (index < 0) {
                arrayFilter.push(reversedData[i]);
              }
            }
          }
          // console.log('ARRAY', arrayFilter);
          this.dataChat = arrayFilter;
          // this.lastMessageId = arrayFilter[0].id;
          setTimeout(() => {
            this.scrollToBottom();
          }, 200);
        } catch (e) {
          console.warn("exception_", e);
        }
      }).catch((qiscusError: any) => {
        console.warn("Gagal Mendapatkan Box Pesan", qiscusError);
        // this.dialogService.openSnackBar({ message:"Gagal Mendapatkan Box Pesan" });
      })
    }
  }

  _onNewMessage(data: any) {
    if (this.userQiscus) {
      if (String(data.room_id_str) === String(this.dataQiscus.id)) {
        if (this.dataChat.length > 0) {
          const tempData = [...this.dataChat];
          const index = tempData.map((uniq) => {
            return uniq.unique_id;
          }).indexOf(data.unique_id);
          const temp = {
            attachment: null,
            avatar: data.user_avatar,
            before_id: data.comment_before_id,
            date: data.timestamp,
            id: data.id,
            isDelivered: false,
            isFailed: false,
            isPending: false,
            isRead: false,
            isSent: true,
            is_deleted: false,
            message: data.message,
            payload: data.payload,
            status: data.status,
            subtype: null,
            time: moment(data.timestamp).format('HH:mm'),
            timestamp: data.timestamp,
            type: 'text',
            unique_id: data.unique_temp_id,
            username_as: data.username,
            username_real: data.email
          };
          if (index > -1) {
            tempData[index] = temp;
          } else {
            tempData.push(temp);
          }
          this.dataChat = [...tempData];
        } else {
          const tempData = [];
          const temp = {
            attachment: null,
            avatar: data.user_avatar,
            before_id: data.comment_before_id,
            date: data.timestamp,
            id: data.id,
            isDelivered: false,
            isFailed: false,
            isPending: false,
            isRead: false,
            isSent: true,
            is_deleted: false,
            message: data.message,
            payload: data.payload,
            status: data.status,
            subtype: null,
            time: moment(data.timestamp).format('HH:mm'),
            timestamp: data.timestamp,
            type: 'text',
            unique_id: data.unique_temp_id,
            username_as: data.username,
            username_real: data.email
          };
          tempData.push(temp);
          this.dataChat = tempData;
        }
        setTimeout(() => {
          this.scrollToBottom();
          this.qs.qiscus.readComment(this.userQiscus.id, data.id);
        }, 100);
      }
    }
  }

  onMessageKeyPress(event: any) {
    // console.log("EVENT_KEYPRESS", event);
    if (event.keyCode !== 13) {
      this.qs.qiscus.publishTyping(1);
      setTimeout(() => {
        this.qs.qiscus.publishTyping(0);
      }, 3000)
    } else {
      this.sendChat();
    }
  }

  sendChat() {
    // console.log('Sending...', this.message );
    // console.log("MESSAGES", this.message);
    const extras = {
      invoiceNumber: this.dataTransaction.invoice_number,
      vendorName: this.dataTransaction.vendor_company.name,
    };
    function isEmpty(obj: any) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    }

    const uniqeIdMessage = String(moment().unix()) + String(Math.random());
    if (this.dataChat !== null)
      if (this.dataChat.length > 0) {
        if (this.message !== this.dataChat[this.dataChat.length - 1].message || String(this.dataChat[this.dataChat.length - 1].time) !== String(moment(new Date()).format("HH:mm")))
          if (this.dataQiscus && this.message) {
            if (this.isReply) {
              const payload = {
                text: this.message ? this.message : '',
                replied_comment_id: this.dataReplied.replyId,
                replied_comment_message: this.dataReplied.replyMessage ? this.dataReplied.replyMessage : '',
                replied_comment_payload: isEmpty(this.dataReplied.replyPayload) ? {} : this.dataReplied.replyPayload,
                replied_comment_sender_email: this.dataReplied.replyEmailUser,
                replied_comment_sender_username: this.dataReplied.replyNameUser,
                replied_comment_type: 'text'
              };
              const dataChatTemp = {
                id: uniqeIdMessage,
                uniqueId: uniqeIdMessage,
                unique_temp_id: uniqeIdMessage,
                message: this.message,
                isDelivered: false,
                isFailed: false,
                isPending: true,
                isRead: false,
                isSent: false,
                is_deleted: false,
                payload: payload,
                time: moment().format('HH:mm'),
                date: moment().format('DD-MM-YYYY'),
                status: 'sending',
                type: 'text',
                username_as: this.userProfile.fullname,
                username_real: this.userQiscus.email
              }
              // console.log('message success!', payload)
              this.expandStateReplied = 'final';
              this.isExpandReplied = false;
              this.dataReplied = {};
              this.isReply = false;
              this.dataChat.push(dataChatTemp);
              setTimeout(() => {
                this.scrollToBottom();
              }, 100);

              this.qs.qiscus.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, 'reply', JSON.stringify(payload), JSON.stringify(extras))
                .then(() => {
                  this.qs.qiscus.publishTyping(0);
                })
                .catch((e: any) => {
                  console.log('message failed!', e);
                  const tempArrayFailedData = [...this.dataChat];
                  const failedTempData = tempArrayFailedData[tempArrayFailedData.length - 1];
                  failedTempData.isPending = false;
                  failedTempData.isFailed = true;
                  tempArrayFailedData[tempArrayFailedData.length - 1] = failedTempData;
                  this.dataChat = tempArrayFailedData;
                });
              this.message = null;
            } else {
              const dataChatTemp = {
                id: uniqeIdMessage,
                uniqueId: uniqeIdMessage,
                unique_temp_id: uniqeIdMessage,
                message: this.message ? this.message : '',
                isDelivered: false,
                isFailed: false,
                isPending: true,
                isRead: false,
                isSent: false,
                is_deleted: false,
                payload: {},
                time: moment().format('HH:mm'),
                date: moment().format('DD-MM-YYYY'),
                status: 'sending',
                type: 'text',
                username_as: this.userProfile.fullname,
                username_real: this.userQiscus.email
              }
              // console.log('message success!')
              this.dataChat.push(dataChatTemp);
              setTimeout(() => {
                this.scrollToBottom();
              }, 100)

              this.qs.qiscus.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, null, null, JSON.stringify(extras))
                .then((resp: any) => {
                  // localStorage.setItem('dataQiscus', JSON.stringify(this.dataChat));
                  this.qs.qiscus.publishTyping(0);
                  // console.log('message success!')
                })
                .catch((e: any) => {
                  console.log('message failed!', e);
                  const tempArrayFailedData = [...this.dataChat];
                  const failedTempData = tempArrayFailedData[tempArrayFailedData.length - 1];
                  failedTempData.isPending = false;
                  failedTempData.isFailed = true;
                  tempArrayFailedData[tempArrayFailedData.length - 1] = failedTempData;
                  this.dataChat = tempArrayFailedData;
                })
              this.message = null;
            }
          }
      } else {
        const dataChatTemp = {
          id: uniqeIdMessage,
          uniqueId: uniqeIdMessage,
          unique_temp_id: uniqeIdMessage,
          message: this.message ? this.message : '',
          isDelivered: false,
          isFailed: false,
          isPending: true,
          isRead: false,
          isSent: false,
          is_deleted: false,
          payload: {},
          time: moment().format('HH:mm'),
          date: moment().format('DD-MM-YYYY'),
          status: 'sending',
          type: 'text',
          username_as: this.userProfile.fullname,
          username_real: this.userQiscus.email
        }
        // console.log('message success!')
        this.dataChat.push(dataChatTemp);
        setTimeout(() => {
          this.scrollToBottom();
        }, 100)

        this.qs.qiscus.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, null, null, JSON.stringify(extras))
          .then((resp: any) => {
            // localStorage.setItem('dataQiscus', JSON.stringify(this.dataChat));
            this.qs.qiscus.publishTyping(0);
            // console.log('message success!')
          })
          .catch((e: any) => {
            console.log('message failed!', e);
            const tempArrayFailedData = [...this.dataChat];
            const failedTempData = tempArrayFailedData[tempArrayFailedData.length - 1];
            failedTempData.isPending = false;
            failedTempData.isFailed = true;
            tempArrayFailedData[tempArrayFailedData.length - 1] = failedTempData;
            this.dataChat = tempArrayFailedData;
          })
        this.message = null;
      }
  }

  async onReplyMessage(item: any) {
    let tempMessage: any;
    let uriImage: any;
    let tempName: any = {};
    let lastPayload: any = {};
    let pending: any;
    // console.log('onReplyMessage', item);
    function isEmpty(obj: any) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    }
    if (isEmpty(item.payload)) {
      tempMessage = await item.message;
      uriImage = '';
    } else if (!isEmpty(item.payload)) {
      tempMessage = await item.message;
      uriImage = '';
      lastPayload = await item.payload;
      if (item.payload.type == 'image') {
        tempMessage = await item.payload.content ? (item.payload.content.caption ? item.payload.content.caption : '') : '';
        uriImage = await item.payload.content.url;
      }
    }

    tempName = item.username_as === undefined ? this.userProfile.fullname : item.username_as;
    if (item.isPending) {
      pending = true;
    } else {
      pending = false;
    }

    this.messageOption = true;
    this.dataReplied = {
      replyId: item.id,
      replyEmailUser: item.username_real,
      replyNameUser: tempName,
      replyPayload: lastPayload,
      replyMessage: tempMessage ? tempMessage : '',
      replyUriImage: uriImage,
    };
    this.pendingMessage = pending;
    this.isReply = true;

    // console.log('DATA REPLIED', this.dataReplied);

    this.expandStateReplied = this.expandStateReplied === 'initial' ? 'final' : 'initial';
    if (this.isExpandReplied) {
      this.isExpandReplied = false;
      setTimeout(() => {
        this.expandStateReplied = 'initial';
        this.isExpandReplied = true;
      }, 300);
    } else {
      this.isExpandReplied = true;
    }
  }

  applyTemplate(templateMessage: any) {
    // console.log('template',templateMessage);
    this.message = templateMessage.body;
  }

  openMedia(type: any, idx: any) {
    console.log('data', this.dataTransaction);
    const dialogConfig = new MatDialogConfig();
    const extras = {
      invoiceNumber: this.dataTransaction.invoice_number,
      vendorName: this.dataTransaction.vendor_company.name,
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { roomId: this.dataTransaction.qiscus_room_id, type: type, order_data: this.dataTransaction };

    this.dialogRef = this.dialog.open(UploadImageQiscusComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        switch (type) {
          case 'product_tagging':
            // this.templateTaskForm.get('image').setValue(response);
            const dataChatTempProduct = {
              id: response.uniqueId,
              uniqueId: response.uniqueId,
              unique_temp_id: response.uniqueId,
              message: response.message,
              isDelivered: false,
              isFailed: false,
              isPending: true,
              isRead: false,
              isSent: false,
              is_deleted: false,
              payload: JSON.parse(response.payload),
              time: moment().format('HH:mm'),
              date: moment().format('DD-MM-YYYY'),
              status: 'sending',
              type: 'product',
              username_as: this.userProfile.fullname,
              username_real: this.userQiscus.email
            }
            this.dataChat.push(dataChatTempProduct);
            // console.log('message success!', this.dataChat)
            setTimeout(() => {
              this.scrollToBottom();
              this.qs.qiscus.sendComment(
                response.roomId, // room id
                response.message,
                response.uniqueId,
                'custom', // message type
                response.payload,
                JSON.stringify(extras)
              )
                .then((resp: any) => {
                  // console.log('Message sent', resp);
                }).catch((e: any) => {
                  console.log('Message failed to send', e);
                });
            }, 100)
            break;
          case 'image':
            // let questions = this.templateTaskForm.get('questions') as FormArray;
            // questions.at(idx).get('question_image').setValue(response);
            const dataChatTemp = {
              id: response.uniqueId,
              uniqueId: response.uniqueId,
              unique_temp_id: response.uniqueId,
              message: response.message,
              isDelivered: false,
              isFailed: false,
              isPending: true,
              isRead: false,
              isSent: false,
              is_deleted: false,
              payload: response.payload,
              time: moment().format('HH:mm'),
              date: moment().format('DD-MM-YYYY'),
              status: 'sending',
              type: 'image',
              username_as: this.userProfile.fullname,
              username_real: this.userQiscus.email
            }
            // console.log('message success!')
            this.dataChat.push(dataChatTemp);
            setTimeout(() => {
              this.scrollToBottom();
              this.qs.qiscus.sendComment(
                response.roomId, // room id
                response.message,
                response.uniqueId,
                'custom', // message type
                response.payload,
                JSON.stringify(extras)
              )
                .then((resp: any) => {
                  // console.log('Message sent', resp);
                }).catch((e: any) => {
                  console.log('Message failed to send', e);
                });
            }, 100)
            break;
          default:
            break;
        }
      }
    });
  }


  uploadImage(item: any) {
    if (item !== null) {
      const uniqueId = String(moment().unix()) + String(Math.random());
      const name = item.name;
      const obj = {
        uri: item,
        type: item.type,
        name: item.fileName
      };
      // console.log('responsePicker', responsePicker);
      // console.log('obj', obj);
      this.qs.qiscus.upload(obj, (error: any, progress: any, fileURL: any) => {
        if (error) return console.log('error when uploading', error);
        if (progress) return console.log(progress.percent);
        if (fileURL != null) {
          const payload = JSON.stringify({
            type: 'image',
            content: {
              url: fileURL,
              file_name: name,
              caption: item.message
            }
          });

          this.qs.qiscus.sendComment(
            this.dataTransaction.qiscus_room_id, // room id
            item.message,
            uniqueId,
            'custom', // message type
            payload
          )
            .then(resp => {
              console.log('Message sent', resp);
            });
        }
      });
    }
  }

  ngOnDestroy() {
    this.qs.qiscus.exitChatRoom();
  }

}