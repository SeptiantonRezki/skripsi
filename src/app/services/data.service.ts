import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class DataService {

    show: any;
    progress: any;
    @Output() change: EventEmitter<boolean> = new EventEmitter();

    showLoading(show) {
        this.show = show;
        this.change.emit(this.show);
    }

    setProgress(value) {
        this.progress = value;
        this.change.emit(this.progress);
    }
    
    setAuthorization(authorization) {
        let auth = JSON.stringify(authorization);
        window.localStorage.setItem('auth',auth);
    }
    
    unSetAuthorization() {
        window.localStorage.removeItem('auth');
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