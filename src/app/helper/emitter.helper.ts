
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class Emitter {
  // Observable navItem source
  private newMessageQ = new BehaviorSubject<object>({});
  private presenceQ = new BehaviorSubject<object>({});
  private typingQ = new BehaviorSubject<object>({});
  private readQ = new BehaviorSubject<object>({});
  private deliveredQ = new BehaviorSubject<object>({});

  private chatIsOpenQ = new BehaviorSubject<boolean>(false);
  private dataChatQ = new BehaviorSubject<object>({});

  private chatAutoOpenQ = new BehaviorSubject<boolean>(false);
  private chatIsExpandQ = new BehaviorSubject<boolean>(false);

  private selectedHelpTabQ = new BehaviorSubject<object>({});

  // QISCUS - MULTICHANNEL
  private newMessageQMC = new BehaviorSubject<object>({});
  private presenceQMC = new BehaviorSubject<object>({});
  private typingQMC = new BehaviorSubject<object>({});
  private readQMC = new BehaviorSubject<object>({});
  private deliveredQMC = new BehaviorSubject<object>({});
  private payMethodDataEmitter = new BehaviorSubject<object>({});


  // Observable navItem stream
  listenNewMessageQ = this.newMessageQ.asObservable();
  listenPresenceQ = this.presenceQ.asObservable();
  listenTypingQ = this.typingQ.asObservable();
  listenReadQ = this.readQ.asObservable();
  listenDeliveredQ = this.deliveredQ.asObservable();

  listenChatIsOpenQ = this.chatIsOpenQ.asObservable();
  listenDataChatQ = this.dataChatQ.asObservable();

  listenChatAutoOpenQ = this.chatAutoOpenQ.asObservable();

  listenChatIsExpandQ = this.chatIsExpandQ.asObservable();

  listenSelectedHelpTabQ = this.selectedHelpTabQ.asObservable();

  // QISCUS - MULTICHANNEL
  listenNewMessageQMC = this.newMessageQMC.asObservable();
  listenPresenceQMC = this.presenceQMC.asObservable();
  listenTypingQMC = this.typingQMC.asObservable();
  listenReadQMC = this.readQMC.asObservable();
  listenDeliveredQMC = this.deliveredQMC.asObservable();
  listenPayMethodDataEmitter = this.payMethodDataEmitter.asObservable();

  // service command
  emitNewMessageQ(message: any) {
    this.newMessageQ.next(message);
  }
  emitPresenceQ(message: any) {
    this.presenceQ.next(message);
  }
  emitTypingQ(message: any) {
    this.typingQ.next(message);
  }
  emitReadQ(message: any) {
    this.readQ.next(message);
  }
  emitDeliveredQ(message: any) {
    this.deliveredQ.next(message);
  }

  emitChatIsOpen(value: boolean) {
    this.chatIsOpenQ.next(value);
  }
  emitDataChat(data: any) {
    this.dataChatQ.next(data);
  }

  emitChatAutoOpen(value: boolean) {
    this.chatAutoOpenQ.next(value);
  }

  emitChatIsExpand(value: boolean) {
    this.chatIsExpandQ.next(value);
  }

  emitSelectedHelpTabQ(data: any) {
    this.selectedHelpTabQ.next(data);
  }

  // QISCUS - MULTICHANNEL
  emitNewMessageQMC(message: any) {
    this.newMessageQMC.next(message);
  }
  emitPresenceQMC(message: any) {
    this.presenceQMC.next(message);
  }
  emitTypingQMC(message: any) {
    this.typingQMC.next(message);
  }
  emitReadQMC(message: any) {
    this.readQMC.next(message);
  }
  emitDeliveredQMC(message: any) {
    this.deliveredQMC.next(message);
  }

  //PRIVATE - LABEL
  private privateLabelEmitter = new BehaviorSubject<object>({});
  listenPrivateLabelEmitter = this.privateLabelEmitter.asObservable();
  emitPrivateLabelEmitter(message: any) {
    this.privateLabelEmitter.next(message);
  }
  emitPayMethodDataEmitter(message: any) { this.payMethodDataEmitter.next(message); }

  //NOTIFICATION - DETAIL
  private notifDetailEmitter = new BehaviorSubject<object>({});
  listenNotifDetailEmitter = this.notifDetailEmitter.asObservable();
  emitNotifDetailEmitter(message: any) {
    this.notifDetailEmitter.next(message);
  }

}