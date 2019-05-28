import { Injectable } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  constructor(private userIdle: UserIdleService) { }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  onTimerStart(){
    return this.userIdle.onTimerStart();
  }

  onTimeout(){
    return this.userIdle.onTimeout();
  }
  onHitEvent(){
    this.userIdle.stopWatching();
    this.userIdle.startWatching();
  }
}
