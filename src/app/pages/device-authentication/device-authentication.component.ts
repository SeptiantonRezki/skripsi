import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { FuseConfigService } from "@fuse/services/config.service";
import { commonFormValidator } from "../../classes/commonFormValidator";
import { AuthenticationService } from "../../services/authentication.service";
import { DataService } from "../../services/data.service";
import { DialogService } from "../../services/dialog.service";
import { forkJoin, Subscription, timer } from "rxjs";
import { take, map } from "rxjs/operators";
import { environment } from "environments/environment";
import { GeneralService } from "app/services/general.service";
import { GoogleAnalyticsService } from "app/services/google-analytics.service";
import * as _ from 'underscore';
import { CookieService } from "ngx-cookie-service";
import { IdleService } from "app/services/idle.service";
import { QiscusService } from "app/services/qiscus.service";
import * as CryptoJS from 'crypto-js';
import { LanguagesService } from "app/services/languages/languages.service";


@Component({
  selector: 'app-device-authentication',
  templateUrl: './device-authentication.component.html',
  styleUrls: ['./device-authentication.component.scss']
})
export class DeviceAuthenticationComponent implements OnInit, OnDestroy {
  activationForm: FormGroup;
  activationFormErrors: any;
  submitting: boolean;
  requestingResend: boolean;
  phoneNumberUrl: string;
  dataRegistered: string;
  environment: any;

  public timerSub: Subscription;
  public value: Number;
  showValue: Boolean;
  username: any;
  base_auth: any;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private gaService: GoogleAnalyticsService,
    private cookieService: CookieService,
    private userIdle: IdleService,
    private qs: QiscusService,
    private ls: LanguagesService
  ) {
    this.environment = environment;
    this.fuseConfig.setConfig({
      layout: {
        navigation: "none",
        toolbar: "none",
        footer: "none"
      }
    });

    this.submitting = false;
    this.requestingResend = false;
    this.username = this.dataService.getFromStorage("bodyLogin") ? this.dataService.getFromStorage("bodyLogin")['username'] : null;
    this.base_auth = this.dataService.getFromStorage("base_auth") ? this.dataService.getFromStorage("bodyLogin")['base_auth'] : null
  }

  ngOnInit() {
    // if (this.base_auth !== 'login') {
    //   this.authenticationService.resendOtpCode({ type: 'verify-account', email: this.username }).subscribe(
    //     res => {
    //     });
    // }
    this.activationForm = this.formBuilder.group({
      code: ["", [Validators.required]]
    });

    let timeRemaining = localStorage.getItem('timeRemaining');
    this.startTimer();
  }

  onChangeDigit(event) {
    console.log("cukkk ck")
    let element = event.srcElement.nextElementSibling; // get the sibling element
    console.log("element", element);
    if (element == null)  // check if its null
      return;
    else
      element.focus();   // focus if not null
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
    this.dataService.showLoading(true);
    let body = {
      code: this.activationForm.get('code').value,
      email: this.username
    };

    this.authenticationService.verifyCode(body).subscribe(res => {
      this.dataService.showLoading(false);
      console.log("console res", res.token)
      if (res && res.token) {
        if (res.token.access_token) {
          this.dataService.setAuthorization(res.token);
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
                  console.log('err', err);
                  this.submitting = false;
                })
              }
            } else {
              this.dataService.unSetAuthorization();
              this.dialogService.openSnackBar({ message: this.ls.locale.device_authentication.text7 });
            }
          });
        } else this.router.navigate(['reset-password/' + this.dataService.getFromStorage('token_reset_password')], { queryParams: { email: this.username } });
      } else {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.ls.locale.device_authentication.text8 });
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  getAreasAsync(area_id = []) {
    let areas = [];
    area_id.map(area => {
      let response = this.generalService.getParentArea({ parent: area });
      areas.push(response);
    });

    return forkJoin(areas);
  }

  public startTimer() {
    this.showValue = true;
    const timeRemaining = localStorage.getItem('timeRemaining');
    const startValue = timeRemaining ? parseInt(timeRemaining) : 30 * 60;

    this.timerSub = timer(0, 1000).pipe(take(startValue + 1), map(value => startValue - value)).subscribe(
      value => {
        this.value = value;

        localStorage.setItem('timeRemaining', value.toString());
        const time_remaining = localStorage.getItem('timeRemaining');
        if (time_remaining == '0') {
          localStorage.removeItem('timeRemaining');
          this.showValue = false;
        }
      },
      null,
      () => this.timerSub = null,
    );
  }

  ngOnDestroy() {
    window.localStorage.removeItem("bodyLogin");
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

}
