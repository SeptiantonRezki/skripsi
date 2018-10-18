import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { DialogService } from "app/services/dialog.service";
import { LandingPageService } from "app/services/inapp-marketing/landing-page.service";
import { commonFormValidator } from "app/classes/commonFormValidator";

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
  public options: Object = {
    key: "mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==",
    placeholderText: "Isi Halaman",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote', 'html'],
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private landingPageService: LandingPageService
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
            message: "Data Berhasil Disimpan"
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
