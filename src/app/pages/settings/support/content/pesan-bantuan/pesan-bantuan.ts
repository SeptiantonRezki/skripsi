import { 
  Component,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Emitter } from "app/helper/emitter.helper";
import { QiscusService } from "app/services/qiscus.service";
import * as moment from "moment";
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap, finalize, tap } from 'rxjs/operators';

import { commonFormValidator } from "../../../../../classes/commonFormValidator";
import { SupportService } from 'app/services/settings/support.service';
import { DialogOtherHelp } from '../../content/dialog/dialog-other-help';
import { DataService } from "../../../../../services/data.service";
import { environment } from '../../../../../../environments/environment';
import { UploadImageComponent } from "./dialog/upload-image/upload-image.component";
@Component({
  selector: 'pesan-bantuan',
  templateUrl: './pesan-bantuan.html',
  styleUrls: ['./pesan-bantuan.scss']
})
export class PesanBantuan {
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  filteredOptions: Observable<any[]>;

  formNewInquiry: FormGroup;
  formNewInquiryErrors: any;
  searchRoomControl = new FormControl();
  
  onLoad: boolean;
  categoryList: any;
  isCreate: boolean;
  dataProfile: any;
  dataRoomSelected: any;
  isLoadingSearch: boolean;
  isSearchFound: boolean;
  roomList: any;
  roomListCopy: any;
  // public kategoriKendala: FormControl = new FormControl();
  // public detailKendala: FormControl = new FormControl();

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
  templateTaskForm: FormGroup;
  dialogRef: any;
  isCancelReply: boolean;
  isLoadMessage: boolean;
  selectedRoomIndex: number;

  constructor(
    private supportService: SupportService,
    public dialog: MatDialog,
    private emitter: Emitter,
    private qs: QiscusService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
  ){
    this.onLoad = true;
    this.categoryList = [];
    this.isCreate = false;
    this.dataProfile = this.dataService.getDecryptedProfile();
    this.dataRoomSelected = null;
    this.isLoadingSearch = false;
    this.isSearchFound = false;
    this.roomList = [];
    this.roomListCopy = [];

    this.dataChat = [];
    this.dataQiscus = null;
    this.dataTransaction = null;
    this.chatIsOver = false;
    this.message = null;
    this.userProfile = this.dataProfile;
    this.userQiscus = this.qs.qiscusMC.userData;
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
    this.isCancelReply = true;
    this.isLoadMessage = false;
    this.selectedRoomIndex = -1;

    this.formNewInquiryErrors = {
      kategoriKendala: '',
      detailKendala: '',
    }
    this.emitter.emitSelectedHelpTabQ({ isCreate: this.isCreate });
    this.emitter.listenSelectedHelpTabQ.subscribe((data: any) => {
      if (data.isCreate !== undefined) {
        this.isCreate = data.isCreate;
        if (data.isCreate) {
          this.formNewInquiry.setValue({
            kategoriKendala: '',
            detailKendala: '',
          });
        }
      }
      if (data.roomList !== undefined) {
        this.roomList = data.roomList.map((item: any) => {
          if (item.options) {
            item.additionalOptions = JSON.parse(item.options);
          }
          return item;
        });
        this.roomListCopy = this.roomList;
      }
      if (data.isActiveRoomChat !== undefined) {
        if (!data.isActiveRoomChat) {
          this.dataRoomSelected = null;
          this.qs.qiscusMC.exitChatRoom();
        }
      }
      if (data.newMessage !== undefined) {
        if (this.roomList.length > 0) {
          const index = this.roomList.map((item: any) => { return item.id; }).indexOf(data.newMessage.room_id);
          if (index >= 0) {
            if(data.newMessage.type == "file_attachment"){
              this.roomList[index].last_comment_message = data.newMessage.payload.caption ? data.newMessage.payload.caption : 'Melampirkan File/Gambar';
            } else {
              this.roomList[index].last_comment_message = data.newMessage.message;
            }
            if (this.dataRoomSelected && String(data.newMessage.room_id_str) === String(this.dataRoomSelected.id)){
              this.roomList[index].count_notif = 0;
              if (data.newMessage.room_options) {
                data.newMessage.room_options = JSON.parse(data.newMessage.room_options);
                if (data.newMessage.room_options.is_resolved) {
                  this.chatIsOver = true;
                } else {
                  this.chatIsOver = false;
                }
              }
            } else {
              if (data.newMessage.email !== this.userQiscus.email) {
                this.roomList[index].count_notif = 1;
              }
            }
          }
        }
        this._onNewMessage(data.newMessage);
      }
    });
  }

  ngOnInit() {
    this.supportService.getBantuanListCategory({ user: 'principal' }).subscribe((res: any) => {
      this.categoryList = res.data;
      if(res && res.data.length > 0) {
        this.isCreate = false;
      } else {
        this.isCreate = true;
      }
      this.emitter.emitSelectedHelpTabQ({ isCreate: this.isCreate });
      this.onLoad = false;
    });
    

    this.formNewInquiry = this.formBuilder.group({
      kategoriKendala: ['', Validators.required],
      detailKendala: ['', Validators.required],
    });
    
    this.formNewInquiry.valueChanges.subscribe((e) => {
      commonFormValidator.parseFormChanged(
        this.formNewInquiry,
        this.formNewInquiryErrors
      );
    });

    this.formNewInquiry.setValue({
      kategoriKendala: '',
      detailKendala: '',
    });

    this.filteredOptions = this.searchRoomControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),
        tap(() => this.isLoadingSearch = true),
        distinctUntilChanged(),
        switchMap(value => this.filter(value) )
      )
    
    this.getRoomListPesanBantuan();
  }

  async submit() {
    this.dataProfile = await this.dataService.getDecryptedProfile();
    if (this.dataProfile && this.formNewInquiry.status == "VALID") {
      if ((this.dataProfile.email || this.dataProfile.phone) && this.dataProfile.fullname) {
        const extras = {
          timezone_offset: new Date().getTimezoneOffset() / -60,
          username: this.dataProfile.fullname,
          usercategory: 'Principal',
          phonenumber: this.dataProfile.phone? (this.dataProfile.phone.substr(0, 1) === '+' ? '0' + this.dataProfile.phone.substr(3, this.dataProfile.phone.length) + '@mail.com' : this.dataProfile.phone + '@mail.com') : this.dataProfile.email,
          city: this.dataProfile.city_name ? this.dataProfile.city_name : null,
          storename: null,
          ismscode: null,
          platform: 'AYO Principal',
          channel: 'Chat',
          status: 'Open',
          inquirycategory: this.formNewInquiry.get('kategoriKendala').value,
          detailedinquiry: this.formNewInquiry.get('detailKendala').value
        };
        // console.log('PARAM', params);
        this.qs.qiscusMC.getNonce().then(async (res) => {
          const params = {
            app_id: environment.qiscus_appIdMC,
            user_id: extras.phonenumber,
            name: this.dataProfile.fullname,
            avatar: this.dataProfile.image_url,
            extras: JSON.stringify(extras),
            nonce: res.nonce,
            reset_extras: true,
          };
          await this.qs.qiscusCreateRoomMultichannel(params).subscribe(async(res_2: any) => {
            this.openDialogSuccess();
            // console.log('qiscusLoginMultichannel', res_2);
            const initiateData = res_2.data;
              if (!this.qs.qiscusMC.isInit) await this.qs.initQiscusMC();
              this.qs.qiscusMC.verifyIdentityToken(initiateData.identity_token).then(async (verifyResponse) => {
                this.qs.qiscusMC.setUserWithIdentityToken(verifyResponse);
                const tempUniqId = String(moment().unix()) + String(Math.random());
                await this.qs.qiscusMC.sendComment(initiateData.room_id, extras.detailedinquiry, tempUniqId, null, null, null);
                const qiscusMC = await this.qs.qiscusMC.getRoomById(initiateData.room_id);
                // console.log('qiscusMC', qiscusMC);
                if (qiscusMC) {
                  const dataQiscus = {
                      roomId: initiateData.room_id,
                      retailer: {
                        username: params.name, // agar saat ganti nama akun d apps terganti juga di Qiscus
                        email: params.user_id // email user QISCUS
                      },
                      roomType: qiscusMC.room_type,
                      isOpenChat: true,
                      lastCommentAt: moment(new Date()).format('DD MMMM'),
                      ...qiscusMC
                  };
                  this.getRoomListPesanBantuan();
                  this.dataRoomSelected = dataQiscus;
                  this.dataRoomSelected.additionalOptions = JSON.parse(dataQiscus.options);
                  if (this.dataRoomSelected.additionalOptions.is_resolved) {
                    this.chatIsOver = true;
                  } else {
                    this.chatIsOver = false;
                  }
                  this.isCreate = false;
                  this.emitter.emitSelectedHelpTabQ({ isCreate: this.isCreate });
                  this.isLoadMessage = true;
                  this._loadRoom(initiateData.room_id);
                }
              });
          });
        });
      } else {
        alert('Maaf, Email atau Nomor Telpon tidak ditemukan! \nSilahkan isi data profil anda dengan lengkap, Terima kasih!');
      }
    } else {
      alert('kategori kendala harus dipilih dan detail kendala harus diisi!');
    }
  }

  openDialogSuccess(e?: any): void {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { target: '', description: 'Kendala Sukses dikirim' };
    const dialogRef = this.dialog.open(DialogOtherHelp, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  backToPusatBantuan() {
    this.emitter.emitSelectedHelpTabQ({ selectedTab: 0 });
    this.isCreate = false;
    this.emitter.emitSelectedHelpTabQ({ isCreate: this.isCreate });
    this.formNewInquiry.setValue({
      kategoriKendala: '',
      detailKendala: '',
    });
  }

  deleteSearch() {
    this.searchRoomControl.setValue('');
  }

  async filter(value: string) {
    if (value) {
      const ret = await this.roomList.filter((item: any) => {
        return item.additionalOptions.extras.inquirycategory.includes(value);
      })
      if (ret && ret.length > 0){
        this.isSearchFound = true;
        this.roomList = ret;
        return [];
      }
      this.isSearchFound = false;
      return [{
        id: null,
        title: "",
        text: "HASIL PENCARIAN untuk \"" + value + "\" tidak ditemukan. Mohon hubungi tim Digital Care untuk pertanyaan ini.",
        value: value,
        disabled: true
      }];
    } else {
      this.isSearchFound = true;
      this.roomList = this.roomListCopy;
      return [];
    }
  }

  openRoomDetail(room: any, index: number) {
    this.selectedRoomIndex = index;
    this.isLoadMessage = true;
    this.dataChat = [];
    this.dataRoomSelected = room;
    this.dataRoomSelected.lastCommentAt = room.last_comment_message_created_at;
    this.dataRoomSelected.additionalOptions = JSON.parse(room.options);
    if (this.dataRoomSelected.additionalOptions.is_resolved) {
      this.chatIsOver = true;
    } else {
      this.chatIsOver = false;
    }
    this._loadRoom(room.id, index);
  }

  goToCreateNewBantuan() {
    this.emitter.emitSelectedHelpTabQ({ selectedTab: 0 });
    this.isCreate = true;
    this.emitter.emitSelectedHelpTabQ({ isCreate: this.isCreate });
    this.formNewInquiry.setValue({
      kategoriKendala: '',
      detailKendala: '',
    });
    this.emitter.emitSelectedHelpTabQ({ selectedTab: 1});
  }

  //QISCUS===========

  messageOnHover(index: number) {
    this.messageIndexHover = index;
    return;
  }

  scrollToBottom(): void {
    try {
      if  (this.myScrollContainer && this.myScrollContainer.nativeElement) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.warn('Scrolling Failed', err);
    }
  }

  @HostListener('scroll', ['$event']) onScroll($event: Event): void {
    const target = $event.srcElement as HTMLTextAreaElement;
    if(target.scrollTop == 0 && !this.state_.isLoadMore){
      this.state_.isLoadMore = false;
      if(this.dataChat !== null){
        if(this.dataChat.length > 0){
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
    this.qs.qiscusMC.loadMore(this.lastMessageId, options)
      .then((res: any) => {
        if (res.length > 0) {
          // console.log("new Loadmore..", res);
          let last = res.map((d: any) => { return this.renderMessageOnLoadMore(d) } );
          // this.lastMessageId = res[0].id;
          // console.log("Loadmore..", last);
          Promise.all(last).then(() => this.dataChat.unshift(...last));
          this.state_.isLoadMore = false;
          // el.scrollIntoView();
        } else {
          // console.log("Tidak ada hasil..", res);
          this.state_.isLoadMore = false;
        }
      }, (err: any) => {
        console.warn("Error load more", err);
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
    if(i !== 0){
      if(email !== this.dataChat[i-1].username_real){
        return true;
      }
      if(this.onDateFilter(this.dataChat[i].timestamp, i)){
        return true;
      }
    } else {
      return true;
    }
    return false;
  }

  onDateFilter(lastTime: any, i: number) {
    if(i !== 0){
      let lt = String(moment(lastTime).format('dddd, DD MMMM YYYY'));
      let pt = String(moment(this.dataChat[i-1].timestamp).format('dddd, DD MMMM YYYY'));
      if(lt !== pt){
        return true;
      }
    } else {
      return true;
    }
    return false;
  }

  isDateToday(date: any){
    let d = String(moment(date).format('dddd, DD MMMM YYYY'));
    let t = String(moment(new Date()).format('dddd, DD MMMM YYYY'));
    if(d === t){
      return true;
    }
    return false;
  }

  dateLive(date: any){
    return String(moment(date).format('dddd, DD MMMM YYYY'));
  }

  _loadRoom(roomId: any, index?: number){
    this.qs.qiscusMC.getRoomById(roomId).then((data: any) => {
      if (index !== undefined) {
        this.roomList[index].count_notif = 0;
      }
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
          this.isLoadMessage = false;
        setTimeout(() => {
          this.scrollToBottom();
        }, 200);
      } catch (e) {
        console.warn("exception_",e);
        this.isLoadMessage = false;

      }
    }).catch((qiscusError: any) => {
      console.warn("Gagal Mendapatkan Box Pesan", qiscusError);
      // this.dialogService.openSnackBar({ message:"Gagal Mendapatkan Box Pesan" });
      this.isLoadMessage = false;
    })
  }

  _onNewMessage(data: any) {
    if (this.userQiscus && this.dataRoomSelected) {
      if (String(data.room_id_str) === String(this.dataRoomSelected.id)){
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
            type: data.type,
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
            type: data.type,
            unique_id: data.unique_temp_id,
            username_as: data.username,
            username_real: data.email
          };
          tempData.push(temp);
          this.dataChat = tempData;
        }
        setTimeout(() => {
          this.scrollToBottom();
          this.qs.qiscusMC.readComment(this.userQiscus.id, data.id);
        }, 100);
      }
    }
  }

  onMessageKeyPress(event: any) {
    // console.log("EVENT_KEYPRESS", event);
    if (event.keyCode !== 13) {
      this.qs.qiscusMC.publishTyping(1);
      setTimeout(() => {
        this.qs.qiscusMC.publishTyping(0);
      }, 3000)
    } else{
      this.sendChat();
    }
  }

  sendChat() {
    // console.log('Sending...', this.message );
    // console.log("MESSAGES", this.message);
    function isEmpty(obj: any) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    }

    const uniqeIdMessage = String(moment().unix()) + String(Math.random());
    if(this.dataChat !== null)
    if(this.dataChat.length > 0){
      if(this.message !== this.dataChat[this.dataChat.length - 1].message || String(this.dataChat[this.dataChat.length - 1].time) !== String(moment(new Date()).format("HH:mm")))
      if(this.dataQiscus && this.message) {
        if(this.isReply){
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
          this.dataReplied =  {};
          this.isReply = false;
          this.dataChat.push(dataChatTemp);
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);

          this.qs.qiscusMC.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, 'reply', JSON.stringify(payload), null)
            .then(() => {
              this.qs.qiscusMC.publishTyping(0);
            })
            .catch((e: any) => {
              console.warn('message failed!', e);
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

          this.qs.qiscusMC.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, null, null, null)
            .then((resp: any) => {
              // localStorage.setItem('dataQiscus', JSON.stringify(this.dataChat));
              this.qs.qiscusMC.publishTyping(0);
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

      this.qs.qiscusMC.sendComment(this.dataQiscus.id, this.message ? this.message : '', uniqeIdMessage, null, null, null)
        .then((resp: any) => {
          // localStorage.setItem('dataQiscus', JSON.stringify(this.dataChat));
          this.qs.qiscusMC.publishTyping(0);
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

  async onReplyMessage(item: any){
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
      if (item.type == 'file_attachment') {
        tempMessage = await item.payload.caption? item.payload.caption : '';
        uriImage = await item.payload.url;
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
      replyMessage: tempMessage? tempMessage : '',
      replyUriImage: uriImage,
    };
    this.pendingMessage = pending;
    this.isReply = true;
    this.isCancelReply = false;
    // console.log('DATA REPLIED', this.dataReplied);
  }

  applyTemplate(templateMessage: any) {
    // console.log('template',templateMessage);
    this.message = templateMessage.body;
  }

  openMedia(type: any, idx: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { roomId: this.dataRoomSelected.id, type: type };

    this.dialogRef = this.dialog.open(UploadImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if(response) {
        switch (type) {
          case 'product_tagging':
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
            setTimeout(() => {
              this.scrollToBottom();
              this.qs.qiscusMC.sendComment(
                response.roomId, // room id
                response.message,
                response.uniqueId,
                'custom', // message type
                response.payload,
                null
              )
              .then((resp: any) => { 
                // console.log('Message sent', resp);
              }).catch((e: any) => {
                console.warn('Message failed to send', e);
              });
            }, 100)
            break;
          case 'image':
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
              type: 'file_attachment',
              username_as: this.userProfile.fullname,
              username_real: this.userQiscus.email
            }
            // console.log('message success!')
            this.dataChat.push(dataChatTemp);
            setTimeout(() => {
              this.scrollToBottom();
              this.qs.qiscusMC.sendComment(
                response.roomId, // room id
                'Send Image',
                response.uniqueId,
                'file_attachment', // message type
                response.payload,
                null
              )
              .then((resp: any) => { 
                // console.log('Message sent', resp);
              }).catch((e: any) => {
                console.warn('Message failed to send', e);
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
      this.qs.qiscusMC.upload(obj, (error: any, progress: any, fileURL: any) => {
        if (error) return console.warn('error when uploading', error);
        if (progress) return console.warn(progress.percent);
        if (fileURL != null) {
            const payload = JSON.stringify({
              type: 'image',
              content: {
                url: fileURL,
                file_name: name,
                caption: item.message
              }
            });
            
            this.qs.qiscusMC.sendComment(
                this.dataRoomSelected.id, // room id
                item.message,
                uniqueId,
                'custom', // message type
                payload
              )
              .then(resp => { 
                // console.warn('Message sent', resp);
              });
        }
      });
    }
  }

  ngOnDestroy(){
    this.qs.qiscusMC.exitChatRoom();
  }

  cancelReply(value) {
    if (value) {
      this.isCancelReply = false;
    } else {
      this.isCancelReply = true;
      this.isReply = false;
      this.dataReplied = {};
    }
  }

  async getRoomListPesanBantuan() {
      const params_ = { 
        page: 1, 
        limit: 100,
        show_participants: false,
        show_empty: false,
      };
      const isLogin = await this.qs.qiscusMC.isLogin;
      if (isLogin) {
        // console.log('isLogin2', isLogin)
      this.userQiscus = await this.qs.qiscusMC.userData;
      console.log('userQiscus', this.userQiscus);
      this.qs.qiscusMC.loadRoomList(params_).then(async (rooms: any) => {
        // console.log('success getRoomList1', rooms)
          // On success
          // if (rooms && rooms.length > 0) {
          //   let countNotif = 0;
          //   await rooms.map((item) => {
          //     if (item.count_notif > 0) {
          //       countNotif = countNotif + 1;
          //     }
          //     return item;
          //   });
          //   console.log('countNotif', countNotif);
          //   this.emitter.emitSelectedHelpTabQ({ roomList: [ ...rooms ] });
          //   if (countNotif) this.countNotifPesanBantuan = countNotif;

            // this.badgePesanBantuan = `<p><span matBadge="4" matBadgeOverlap="false">Text with a badge</span></p>`;
            // var d1 = this.elementRef.nativeElement.querySelector('#mat-tab-label-0-1');
            // console.log('d1', d1);
            // d1.insertAdjacentHTML('beforeend', this.badgePesanBantuan);
          // }
          if(rooms.length > 0) {
            this.roomList = rooms.map((item: any) => {
              if (item.options) {
                item.additionalOptions = JSON.parse(item.options);
              }
              return {...item};
            });
            this.roomListCopy = this.roomList;
          }
          // console.log('success getRoomList2', rooms)
        // resolve(console.log('success getRoomList', rooms));
      }).catch((error: any) => {
          // On error
        // reject(console.log('error getRoomList', error));
        console.warn('failed to get room list', error)
      });
    } else {
        // console.log('isLogin', isLogin)
        setTimeout(() => {
          this.getRoomListPesanBantuan()
        }, 1500);
    }
  }

}

