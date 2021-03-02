import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { AuthenticationService } from "../../services/authentication.service";
import { DataService } from "../../services/data.service";
import { Router } from "@angular/router";
import { commonFormValidator } from "../../classes/commonFormValidator";
import { DialogService } from "../../services/dialog.service";
import { CookieService } from "ngx-cookie-service";
import * as CryptoJS from 'crypto-js';
import { environment } from "environments/environment";
import { IdleService } from "../../services/idle.service";
import { GeneralService } from "app/services/general.service";
import * as _ from 'underscore';
import { forkJoin } from "rxjs";
import { QiscusService } from "app/services/qiscus.service";
import { ActivatedRoute } from '@angular/router';
import { Config } from "app/classes/config";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFormErrors: any;
  submitting: boolean;

  rememberMe: FormControl = new FormControl();

  username: any;
  password: any;
  userlogin: any;
  environment: any;

  showPassword = false;
  showExternalUserFields = false;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private cookieService: CookieService,
    private userIdle: IdleService,
    private generalService: GeneralService,
    private qs: QiscusService,
    private route: ActivatedRoute
  ) {
    this.fuseConfig.setConfig({
      layout: {
        navigation: "none",
        toolbar: "none",
        footer: "none"
      }
    });

    this.loginFormErrors = {
      email: {},
      password: {}
    };

    this.submitting = false;
    this.rememberMe.setValue(false);

    this.environment = environment;
  }

  ngOnInit() {
    let authCode = this.route.snapshot.queryParamMap.get('code');
    if(authCode) {
      this.authenticationService.getUserCognitoAD(authCode).subscribe(res => {
        this.authorize(res)
      }, err => {
        console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
      });
    }

    this.userlogin = this.cookieService.getAll();

    try {
      let decryptedUN = CryptoJS.AES.decrypt(this.userlogin['_udxtrn'], 'dxtr-asia.sampoerna');
      let decryptedPW = CryptoJS.AES.decrypt(this.userlogin['_pdxstr'], 'dxtr-asia.sampoerna');

      this.username = decryptedUN.toString(CryptoJS.enc.Utf8);
      this.password = decryptedPW.toString(CryptoJS.enc.Utf8);

      if (this.userlogin['_udxtrn']) {
        this.rememberMe.setValue(true);
        this.showExternalUserFields = true;
      }
    } catch (error) {

    }

    this.loginForm = this.formBuilder.group({
      username: [this.username, [Validators.required]],
      // password: [this.password, Validators.required]
    });

    this.loginForm.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.loginForm,
        this.loginFormErrors
      );
    });
  }

  async qiscusLoginOrRegister(profile: any) {
    if (profile) {
      if (profile.id !== undefined && profile.id !== null) {
        const qiscusPayload = {
          userId: profile.id + 'vendorhms' + profile.vendor_company_id,
          userIdMC: profile.email,
          userKey: 'vendorhms' + profile.id, //profile.qiscus_user_key,
          userName: profile.fullname,
          avatarImage: profile.image_url || null,
        }

        const qiscusMCPayload = {
          user_id: qiscusPayload.userIdMC,
          password: qiscusPayload.userKey,
          username: qiscusPayload.userName,
          avatar_url: qiscusPayload.avatarImage,
        };
        await this.qs.qiscus.setUser(qiscusPayload.userId, qiscusPayload.userKey, qiscusPayload.userName, qiscusPayload.avatarImage);
        return await this.qs.qiscusLoginMultichannel(qiscusMCPayload).subscribe(async (res_2: any) => {
          return await this.qs.qiscusMC.setUser(qiscusMCPayload.user_id, qiscusMCPayload.password, qiscusMCPayload.username, qiscusMCPayload.avatar_url);
        });
      } else {
        console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
        // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
        return false;
      }
    } else {
      console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
      // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
      return false;
    }
  }

  submit() {
    let username = this.loginForm.get("username").value.toLowerCase();
    let internal = username.match(/.+@pmintl\.net/) || username.match(/.+@sampoerna\.com/);
    if(internal) {
      window.location.href= environment.cognito_login_url;
      return;
    } else if(!this.showExternalUserFields) {
      this.showExternalUserFields = true;
      this.loginForm.addControl('password', new FormControl(this.password, [Validators.required]))
      return;
    }

    if (this.loginForm.valid) {    
        this.submitting = true;
        let body = {
          username: this.loginForm.get("username").value,
          password: this.loginForm.get("password").value
        };
        this.authenticationService.login(body).subscribe(
          res => {
            this.authorize(res);
          },
          err => {
            this.submitting = false;
          }
        );
    } else {
      commonFormValidator.validateAllFields(this.loginForm);
    }
  }

  getAreasAsync(area_id = []) {
    let areas = [];
    area_id.map(area => {
      let response = this.generalService.getParentArea({ parent: area });
      areas.push(response);
    });

    return forkJoin(areas);
  }


  authorize(res) {
    if (!res.access_token) {
      if(this.showExternalUserFields) {
        let encValUsername = CryptoJS.AES.encrypt(this.loginForm.get("username").value, "dxtr-asia.sampoerna").toString();
        let encValPassword = CryptoJS.AES.encrypt(this.loginForm.get("password").value, "dxtr-asia.sampoerna").toString();
        if (this.rememberMe.value) {
          this.cookieService.set('_udxtrn', encValUsername);
          this.cookieService.set('_pdxstr', encValPassword);

        } else {
          this.cookieService.delete('_udxtrn');
          this.cookieService.delete('_pdxstr');
        }
      }
      this.dataService.setToStorage('bodyLogin', { username: res.email, base_auth: "login" });
      this.router.navigate(['device/authentication']);
      return;
    }
    this.dataService.setAuthorization(res);
    this.authenticationService.getProfileDetail().subscribe(async profile => {
      if (profile.status == "active") {
        this.userIdle.startWatching();
        const area_id = profile['area_id'];
        // const areaType = await this.generalService.getParentArea({ parent: _.last(area_id) }).toPromise().catch(err => { this.submitting = false; throw err; });
        if (profile.type == 'vendor') {
          this.dataService.setEncryptedProfile(profile);
          this.router.navigate(["dashboard"]);
          this.submitting = false;
          this.qiscusLoginOrRegister(profile);
          return;
        }

        if (profile.type == "supplier") {
          this.dataService.setEncryptedProfile(profile);
          this.router.navigate(["dashboard"]);
          this.submitting = false;
          this.qiscusLoginOrRegister(profile);
        } else {
          this.getAreasAsync(area_id).subscribe(res => {
            let area_type = res ? res.map(r => r.data) : [];
            profile['area_type'] = area_type[0] ? area_type[0] : [];
            profile['areas'] = area_type;

            this.dataService.setEncryptedProfile(profile);
            this.router.navigate(["dashboard"]);
            this.submitting = false;
            this.qiscusLoginOrRegister(profile);
          }, err => {
            console.log(err);
            this.submitting = false;
          })
        }
      } else {
        this.dataService.unSetAuthorization();
        this.dialogService.openSnackBar({ message: 'Akun Anda tidak Aktif! Harap hubungi Admin!' });
      }
      
      if(this.showExternalUserFields) {
        let encValUsername = CryptoJS.AES.encrypt(this.loginForm.get("username").value, "dxtr-asia.sampoerna").toString();
        let encValPassword = CryptoJS.AES.encrypt(this.loginForm.get("password").value, "dxtr-asia.sampoerna").toString();
        
        if (this.rememberMe.value) {
          this.cookieService.set('_udxtrn', encValUsername);
          this.cookieService.set('_pdxstr', encValPassword);

        } else {
          this.cookieService.delete('_udxtrn');
          this.cookieService.delete('_pdxstr');
        }
      }
    });
  }
}
