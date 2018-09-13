import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationService } from "../../services/authentication.service";
import { DataService } from "../../services/data.service";
import { Router } from "@angular/router";
import { commonFormValidator } from "../../classes/commonFormValidator";
import { DialogService } from "../../services/dialog.service";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFormErrors: any;
  submitting: boolean;

  constructor(
    private fuseConfig: FuseConfigService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router
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
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required]
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
