import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: "timeRemaining",
})
export class TimeRemainingPipe implements PipeTransform {
  transform(value: any) {
    let seconds: string|number = Math.floor(value);
    let minutes: string|number = Math.floor(value / 60);
    
    seconds -= minutes*60;

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    
    return `${minutes}:${seconds}`;
  }
}