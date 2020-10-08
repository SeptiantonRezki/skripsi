import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { FuseConfigService } from "@fuse/services/config.service";
import { commonFormValidator } from "../../classes/commonFormValidator";
import { AuthenticationService } from "../../services/authentication.service";
import { DataService } from "../../services/data.service";
import { DialogService } from "../../services/dialog.service";
import { Subscription, timer } from "rxjs";
import { take, map } from "rxjs/operators";
import { environment } from "environments/environment";
import { GeneralService } from "app/services/general.service";
import { GoogleAnalyticsService } from "app/services/google-analytics.service";
import * as _ from 'underscore';

@Component({
  selector: 'app-device-authentication',
  templateUrl: './device-authentication.component.html',
  styleUrls: ['./device-authentication.component.scss']
})
export class DeviceAuthenticationComponent implements OnInit {
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
  }

  ngOnInit() {
    this.authenticationService.resendOtpCode({ type: 'verify-account', email: this.username }).subscribe(
      res => {
      });
    this.activationForm = this.formBuilder.group({
      code: ["", [Validators.required]]
    });

    let timeRemaining = localStorage.getItem('timeRemaining');
    this.startTimer();
  }

  submit() {
    this.dataService.showLoading(true);
    let body = {
      code: this.activationForm.get('code').value,
      email: this.username
    };

    this.authenticationService.verifyCode(body).subscribe(res => {
      this.dataService.showLoading(false);
      if (res && res.token) {
        this.router.navigate(['reset-password/' + this.dataService.getFromStorage('token_reset_password')], { queryParams: { email: this.username } });
      } else {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: 'Gagal mengautorisasi OTP silahkan coba lagi' });
      }
    }, err => {
      this.dataService.showLoading(false);
    })
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
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

}