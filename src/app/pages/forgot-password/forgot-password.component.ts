import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationService } from "../../services/authentication.service";
import { DialogService } from "../../services/dialog.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  forgotPasswordFormErrors: any;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService
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
      });
    } else {
      this.dialogService.openSnackBar({ message: "Email harus diisi" });
    }
  }
}
