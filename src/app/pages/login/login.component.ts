import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationService } from "../../services/authentication.service";
import { DataService } from "../../services/data.service";
import { Router } from "@angular/router";
import { commonFormValidator } from "../../classes/commonFormValidator";
import { DialogService } from "../../services/dialog.service";
import { CookieService } from "ngx-cookie-service";

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

  showPassword = false;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private cookieService: CookieService
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
  }

  ngOnInit() {
    this.userlogin = this.cookieService.getAll();

    try {
      this.username = this.userlogin['username'];
      this.password = this.userlogin['password'];

      if(this.userlogin['username']) {
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
          this.authenticationService.getProfileDetail().subscribe(profile => {
            if (profile.status == "active") {
              this.dataService.setToStorage("profile", profile);
              this.router.navigate(["dashboard"]);
              this.submitting = false;
            } else {
              this.dataService.unSetAuthorization();
              this.dialogService.openSnackBar({ message: 'Akun Anda tidak Aktif! Harap hubungi Admin!' });
            }

            if(this.rememberMe.value) {
              this.cookieService.set('username', this.loginForm.get("username").value);
              this.cookieService.set('password', this.loginForm.get("password").value);
            } else {
              this.cookieService.delete('username');
              this.cookieService.delete('password');
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
