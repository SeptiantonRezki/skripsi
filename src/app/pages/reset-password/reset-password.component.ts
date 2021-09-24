import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationService } from "app/services/authentication.service";
import { DialogService } from "../../services/dialog.service";
import {
  Router,
  ActivatedRoute,
  Params
} from "../../../../node_modules/@angular/router";
import { environment } from "environments/environment";
import { DataService } from "app/services/data.service";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"]
})
export class ResetPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  forgotPasswordFormErrors: any;
  token: any;
  email: any;

  showPassword = false;
  showConfirmPassword = false;

  environment: any;
  status: any;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private ls: LanguagesService
  ) {
    this.fuseConfig.setConfig({
      layout: {
        navigation: "none",
        toolbar: "none",
        footer: "none"
      }
    });

    this.forgotPasswordFormErrors = {
      password: {},
      password_confirmation: {}
    };

    this.activatedRoute.params.subscribe((res: Params) => {
      this.token = res['token'];
      // console.log('Token: '+ this.token);
    });

    this.activatedRoute.queryParams.subscribe(res => {
      this.email = res['email'];
    })

    this.activatedRoute.params.subscribe(params => {
      this.dataService.setToStorage('token_reset_password', params.token);
    });

    this.activatedRoute.queryParams
      .subscribe(params => {
        console.log(params); // { order: "popular" }
        this.status = params.status;
      });

    this.environment = environment;
  }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      password: ["", Validators.required],
      password_confirmation: ["", Validators.required]
    });

    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.onForgotValuesChanged();
    });
  }

  onForgotValuesChanged() {
    for (const field in this.forgotPasswordFormErrors) {
      if (!this.forgotPasswordFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.forgotPasswordFormErrors[field] = {};

      // Get the control
      const control = this.forgotPasswordForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.forgotPasswordFormErrors[field] = control.errors;
      }
    }
  }

  submit() {
    if (this.forgotPasswordForm.valid) {
      let email = this.email.toLowerCase()
      let internal = email.match(/.+@pmintl\.net/) || email.match(/.+@sampoerna\.com/) || email.match(/.+@contracted\.sampoerna\.com/);

      if (internal) {
        this.dialogService.openSnackBar({ message: this.ls.locale.reset_password.text6 });
        return;
      }

      const password = this.forgotPasswordForm.get("password").value;
      const password_confirmation = this.forgotPasswordForm.get("password_confirmation").value;

      if (password.trim() === password_confirmation.trim()) {
        const body = {
          password: password,
          password_confirmation: password_confirmation,
          email: this.email,
          token: this.token
        };

        this.authenticationService.resetPassword(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: this.ls.locale.reset_password.text7 });
            this.router.navigate(['login']);
          },
          err => {
            console.log(err)
          }
        )
      } else {
        this.dialogService.openSnackBar({ message: this.ls.locale.reset_password.text8 });
      }
    }
  }
}
