
import { Injectable, NgZone } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { DataService } from 'app/services/data.service';

@Injectable()
export class StorageHelper {

  constructor(
    private dataService: DataService,
    private zone: NgZone
  ) {

  }

  setUserQiscus = async (item: any) => {
    try {
      this.zone.run(async () => {
        const encrypt = CryptoJS.AES.encrypt(JSON.stringify(item), 'WS-CRYPT-QISCUS').toString();
        await this.dataService.setToStorage("_dxtqc", encrypt); // data Qiscus
      });
    } catch (err) {
      throw err;
    }
  };

  async getUserQiscus() {
    try {
      return await new Promise(async (resolve, reject) => {
        const userQiscus = await this.dataService.getFromStorage("_dxtqc");
        if (userQiscus !== null) {
          const bytes = CryptoJS.AES.decrypt(userQiscus, 'WS-CRYPT-QISCUS');
          const final = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          // console.log('FINAL',final.user)
          resolve(final.user);
        }
        reject(null);
      });
    } catch (error) {
      console.error('Error retrieving data', error);
      return null;
    }
  };
}