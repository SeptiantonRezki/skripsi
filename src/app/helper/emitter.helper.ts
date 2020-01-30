
import { Injectable }      from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class Emitter {
  // Observable navItem source
  private selectedHelpTabQ = new BehaviorSubject<object>({});

  // QISCUS - MULTICHANNEL
  private newMessageQMC = new BehaviorSubject<object>({});
  private presenceQMC = new BehaviorSubject<object>({});
  private typingQMC = new BehaviorSubject<object>({});
  private readQMC = new BehaviorSubject<object>({});
  private deliveredQMC = new BehaviorSubject<object>({});


  // Observable navItem stream
  listenSelectedHelpTabQ = this.selectedHelpTabQ.asObservable();

  // QISCUS - MULTICHANNEL
  listenNewMessageQMC = this.newMessageQMC.asObservable();
  listenPresenceQMC = this.presenceQMC.asObservable();
  listenTypingQMC = this.typingQMC.asObservable();
  listenReadQMC = this.readQMC.asObservable();
  listenDeliveredQMC = this.deliveredQMC.asObservable();

  // service command

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

}