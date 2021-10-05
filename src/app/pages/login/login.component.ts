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
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

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
  internalSigningIn = false;
  language: string;

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
    private route: ActivatedRoute,
    private ls: LanguagesService,
    private translate: TranslateService
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
      this.internalSigningIn = true;

      this.authenticationService.getUserCognitoAD(authCode).subscribe(res => {
        this.authorize(res)
        this.internalSigningIn = false;
      }, err => {
        console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
        this.internalSigningIn = false;
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
      ...(this.showExternalUserFields && {password: [this.password, Validators.required]})
    });

    this.loginForm.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.loginForm,
        this.loginFormErrors
      );
    });

    this.getInitLocale();
  }

  async getInitLocale() {
    const lang = await localStorage.getItem('user_country');
    this.language = lang || this.ls.selectedLanguages || 'id';
  }

  changeSelectedLanguage(event: any) {
    if (event) {
      this.ls.selectedLanguages = event.value;
      localStorage.setItem('user_country', event.value);
      this.translate.use(event.value);
    }
  }

  async qiscusLoginOrRegister(profile: any) {
    if (profile) {
      this.qs.qiscusMC.getNonce().then((gn: any) => {
        if (gn && gn.nonce) {
          return new Promise((resolve, reject) => {
            this.qs.createJWTMC({ nonce: gn.nonce }).subscribe((res: any) => {
              resolve(res);
            }, (err) => {
              reject(err);
            });
          });
        }
      }).then((jwt: any) => {
        if (jwt && jwt.data) {
          return this.qs.qiscusMC.verifyIdentityToken(jwt.data);
        }
      }).then((userData: any) => {
        if (userData) {
          this.qs.qiscusMC.setUserWithIdentityToken(userData);
          return userData;
        }
      });

      this.qs.qiscus.getNonce().then(async (gn: any) => {
        if (gn && gn.nonce) {
          return new Promise((resolve, reject) => {
            this.qs.createJWT({ nonce: gn.nonce }).subscribe((res: any) => {
              resolve(res);
            }, (err) => {
              reject(err);
            });
          });
        }
      }).then((jwt: any) => {
        if (jwt && jwt.data) {
          return this.qs.qiscus.verifyIdentityToken(jwt.data);
        }
      }).then((userData: any) => {
        if (userData) {
          this.qs.qiscus.setUserWithIdentityToken(userData);
          return userData;
        }
      });
    } else {
      console.warn('Maaf, Terjadi Kesalahan Server! (failed to redirecting realtime server)');
      // this.dialogService.openSnackBar({ message:"Maaf, Terjadi Kesalahan Server!" });
      return false;
    }
  }

  submit() {
    let username = this.loginForm.get("username").value.toLowerCase();
    let internal = username.match(/.+@pmintl\.net/) || username.match(/.+@sampoerna\.com/) || username.match(/.+@contracted.sampoerna.com/);
    if(internal) {
      window.location.href= environment.cognito_login_url;
      return;
    } else {
      this.authenticationService.checkUserStatus(username).subscribe(
        res => {
          if(res.status && res.user_status === 'internal') {
            window.location.href = environment.cognito_login_url;
          } else {
            if(!this.showExternalUserFields) {
              this.showExternalUserFields = true;
              this.loginForm.addControl('password', new FormControl(this.password, [Validators.required]))
              return;
            }
  
            this.loginExternal()
          }
        },
        err => {
          console.log(err)
        }
      );
    }
  }

  loginExternal() {
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
