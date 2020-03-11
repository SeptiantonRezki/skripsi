
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class Emitter {
  //PRIVATE - LABEL
  private privateLabelEmitter = new BehaviorSubject<object>({});
  listenPrivateLabelEmitter = this.privateLabelEmitter.asObservable();
  emitPrivateLabelEmitter(message: any) { this.privateLabelEmitter.next(message); }

}