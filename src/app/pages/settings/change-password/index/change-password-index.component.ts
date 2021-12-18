import { Component, OnInit } from "@angular/core";
import { DataService } from "../../../../services/data.service";
import { FormGroup, FormBuilder, Validators } from "../../../../../../node_modules/@angular/forms";
import { AuthenticationService } from "../../../../services/authentication.service";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { DialogService } from "../../../../services/dialog.service";
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: 'app-change-password-index',
  templateUrl: './change-password-index.component.html',
  styleUrls: ['./change-password-index.component.scss']
})
export class ChangePasswordIndexComponent implements OnInit {
  profile: any;
  changePassword: FormGroup;
  changePasswordError: any;

  showCurrentPassword = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
    private ls: LanguagesService
  ) {
    // this.profile = this.dataService.getFromStorage("profile") || [];
    this.profile = this.dataService.getDecryptedProfile() || [];
    this.changePasswordError = {
      old_password: {},
      password: {},
      password_confirmation: {}
    }
  }

  ngOnInit() {
    this.changePassword = this.formBuilder.group({
      old_password: ["", Validators.required],
      password: ["", Validators.required],
      password_confirmation: ["", Validators.required]
    })

    this.changePassword.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.changePassword, this.changePasswordError);
    })
  }

  submit() {
    if (this.changePassword.valid) {
      let body = {
        old_password: this.changePassword.get('old_password').value,
        password: this.changePassword.get('password').value,
        password_confirmation: this.changePassword.get('password_confirmation').value
      }

      if (body.password === body.password_confirmation) {
        this.authenticationService.changePasswordEditProfile(body).subscribe(
          res => {
            this.dialogService.openSnackBar({ message: 'Kata Sandi berhasil diubah.' });
            this.ngOnInit();
          }
        )
      } else {
        this.dialogService.openSnackBar({ message: "Konfirmasi kata sandi Anda tidak sesuai." });
      }
    } else {
      commonFormValidator.validateAllFields(this.changePassword);
    }
  }
}
