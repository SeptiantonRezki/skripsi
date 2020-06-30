import { Injectable, Output, EventEmitter } from '@angular/core';
import * as SJCL from "sjcl";

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
        // window.localStorage.setItem('auth', auth);
        let encAuth = SJCL.encrypt("dxtr-asia.sampoerna", auth);
        window.localStorage.setItem('_adxtrn', JSON.stringify(encAuth));
    }

    unSetAuthorization() {
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('_adxtrn');
    }

    getAuthorization() {
        let auth = this.getDecryptedAuth();
        if (auth) {
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

    getDecryptedProfile() {
        let data = window.localStorage.getItem("_prfdxtrn");
        if (!data) return null;

        let enc = SJCL.decrypt("dxtr-asia.sampoerna", JSON.parse(data));
        return JSON.parse(enc);
    }

    setEncryptedProfile(profile) {
        let encryptedProfile = SJCL.encrypt("dxtr-asia.sampoerna", JSON.stringify(profile));

        this.setToStorage("_prfdxtrn", encryptedProfile);
    }

    getDecryptedAuth() {
        let data = JSON.parse(window.localStorage.getItem('_adxtrn'));
        if (!data) return null;

        let enc = SJCL.decrypt("dxtr-asia.sampoerna", data);

        return JSON.parse(enc);
    }

    setEncryptedPermissions(permissions) {
        let encryptedPermissions = SJCL.encrypt("dxtr-asia.sampoerna", JSON.stringify(permissions));

        this.setToStorage("_prmdxtrn", encryptedPermissions);
    }

    getEncryptedPermissions() {
        let data = window.localStorage.getItem("_prmdxtrn");
        if (!data) return null;

        let enc = SJCL.decrypt("dxtr-asia.sampoerna", JSON.parse(data));
        return JSON.parse(enc);
    }

}