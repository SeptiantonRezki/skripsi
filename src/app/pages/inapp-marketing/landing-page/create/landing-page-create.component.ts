import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { DialogService } from "app/services/dialog.service";
import { LandingPageService } from "app/services/inapp-marketing/landing-page.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { Config } from 'app/classes/config';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-landing-page-create",
  templateUrl: "./landing-page-create.component.html",
  styleUrls: ["./landing-page-create.component.scss"]
})
export class LandingPageCreateComponent {
  formPageGroup: FormGroup;
  formPageError: any;

  listStatus: any[] = [
    { name: "Status Aktif", value: 1 },
    { name: "Status Non Aktif", value: 0 }
  ];

  files: File;
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private landingPageService: LandingPageService,
    private ls: LanguagesService
  ) {
    this.formPageError = {
      title: "",
      body: ""
    };
  }

  ngOnInit() {
    this.formPageGroup = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      status: [1, Validators.required]
    });

    this.formPageGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formPageGroup,
        this.formPageError
      );
    });
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formPageGroup.status === "VALID") {
      let body: Object = {
        title: this.formPageGroup.get("title").value,
        body: this.formPageGroup.get("body").value,
        status: this.formPageGroup.get("status").value
      };

      this.landingPageService.create(body).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["advertisement", "landing-page"]);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
        },
        err => {
          this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formPageGroup);
    }
  }
}
