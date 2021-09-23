import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationService } from "../../services/authentication.service";
import { DialogService } from "../../services/dialog.service";
import {
  Router,
  ActivatedRoute,
  Params
} from "../../../../node_modules/@angular/router";
import { environment } from "environments/environment";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  forgotPasswordFormErrors: any;

  environment: any;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService,
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
      email: {}
    };

    this.environment = environment;
  }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]]
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
      let body = {
        email: this.forgotPasswordForm.get("email").value
      };

      this.authenticationService.changePassword(body).subscribe(res => {
        console.log(res);
        this.router.navigate(['login']);
        this.dialogService.openSnackBar({ message: res.status });
      });
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.forgot_password.text4 });
    }
  }
}
