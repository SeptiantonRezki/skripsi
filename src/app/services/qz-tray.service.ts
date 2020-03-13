
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';

import * as qz from 'qz-tray';
import { sha256 } from 'js-sha256';


@Injectable()
export class QzTrayService {
  constructor() {
    qz.api.setSha256Type(data => sha256(data));
    qz.api.setPromiseType(resolver => new Promise(resolver));
  }

  errorHandler(error: any): Observable<any> {
    return Observable.throw(error);
  }

  // getConnected(): Observable<any> {
  //   return Observable
  //   .fromPromise(qz.websocket.connect()
  //   .then(qz.printers.getDefault))
  //   // .then((printer: string) => printer))
  //   .map(printer => printer)
  //   .catch(this.errorHandler);
  // }
    
  // Get list of printers connected
  getPrinters(): Observable<string[]> {
    return Observable
      .fromPromise(qz.websocket.connect().then(() => qz.printers.find()))
      .map((printers: string[]) => printers)
      .catch(this.errorHandler);
  }
    
  // Get the SPECIFIC connected printer
  getPrinter(): Observable<any> {
    return Observable
      .fromPromise(qz.websocket.connect().then(qz.printers.getDefault).then((printer) => printer))
      .map((printer: string) => printer)
      .catch(this.errorHandler);
  }
    
  // Print data to chosen printer
  printData(printer: string, data: any, cfg): Observable<any> {
    // Create a default config for the found printer
    const config = qz.configs.create(printer, cfg);
    return Observable.fromPromise(qz.print(config, data))
      .map((anything: any) => anything)
      .catch(this.errorHandler);
  }
   
  // Disconnect QZ Tray from the browser
  removePrinter(): void {
     qz.websocket.disconnect();
  }
}