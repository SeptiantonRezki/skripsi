import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
    
    setAuthorization(authorization) {
       let auth = JSON.stringify(authorization);
       window.localStorage.setItem('auth',auth);
    }
    
    getAuthorization() {
        let auth = JSON.parse(window.localStorage.getItem('auth'));
        if(auth){
          return auth;
        }
        return null;
    }

    setToStorage(key, value) {
        let data = JSON.stringify(value);
        window.localStorage.setItem(key, data);
    }

    getFromStorage(key) {
        let data = JSON.parse(window.localStorage.getItem(key));
        return data;
    }

}