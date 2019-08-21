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

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private cookieService: CookieService,
    private userIdle: IdleService,
    private generalService: GeneralService
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
    this.userlogin = this.cookieService.getAll();

    try {
      let decryptedUN = CryptoJS.AES.decrypt(this.userlogin['_udxtrn'], 'dxtr-asia.sampoerna');
      let decryptedPW = CryptoJS.AES.decrypt(this.userlogin['_pdxstr'], 'dxtr-asia.sampoerna');

      this.username = decryptedUN.toString(CryptoJS.enc.Utf8);
      this.password = decryptedPW.toString(CryptoJS.enc.Utf8);

      if (this.userlogin['_udxtrn']) {
        this.rememberMe.setValue(true);
      }
    } catch (error) {

    }

    this.loginForm = this.formBuilder.group({
      username: [this.username, [Validators.required]],
      password: [this.password, Validators.required]
    });

    this.loginForm.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.loginForm,
        this.loginFormErrors
      );
    });
  }

  submit() {
    if (this.loginForm.valid) {
      this.submitting = true;
      let body = {
        username: this.loginForm.get("username").value,
        password: this.loginForm.get("password").value
      };
      this.authenticationService.login(body).subscribe(
        res => {
          this.dataService.setAuthorization(res);
          this.authenticationService.getProfileDetail().subscribe(async profile => {
            if (profile.status == "active") {
              this.userIdle.startWatching();
              const area_id = profile['area_id'];
              const areaType = await this.generalService.getParentArea({ parent: _.last(area_id) }).toPromise().catch(err => { this.submitting = false; throw err; });
              profile['area_type'] = areaType.data;
              this.dataService.setEncryptedProfile(profile);
              // this.dataService.setToStorage("profile", profile);
              this.router.navigate(["dashboard"]);
              this.submitting = false;
            } else {
              this.dataService.unSetAuthorization();
              this.dialogService.openSnackBar({ message: 'Akun Anda tidak Aktif! Harap hubungi Admin!' });
            }

            let encValUsername = CryptoJS.AES.encrypt(this.loginForm.get("username").value, "dxtr-asia.sampoerna").toString();
            let encValPassword = CryptoJS.AES.encrypt(this.loginForm.get("password").value, "dxtr-asia.sampoerna").toString();

            if (this.rememberMe.value) {

              this.cookieService.set('_udxtrn', encValUsername);
              this.cookieService.set('_pdxstr', encValPassword);

            } else {
              this.cookieService.delete('_udxtrn');
              this.cookieService.delete('_pdxstr');
            }
          });
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.loginForm);
    }
  }
}
