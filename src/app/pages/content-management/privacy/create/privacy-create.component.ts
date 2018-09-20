import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PrivacyService } from 'app/services/content-management/privacy.service';

@Component({
  selector: 'app-privacy-create',
  templateUrl: './privacy-create.component.html',
  styleUrls: ['./privacy-create.component.scss']
})
export class PrivacyCreateComponent {

  formPrivacy: FormGroup;
  formPrivacyError: any;

  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  files: File;
  public options: Object = {
    placeholderText: "Isi Konten",
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
    private privacyService: PrivacyService
  ) {
    this.formPrivacyError = {
      title: {},
      body: {},
      user: {}
    };
  }

  ngOnInit() {
    this.formPrivacy = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required]
    });

    this.formPrivacy.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formPrivacy, this.formPrivacyError);
    });
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formPrivacy.valid) {
      let body: Object = {
        title: this.formPrivacy.get("title").value,
        body: this.formPrivacy.get("body").value,
        user: this.formPrivacy.get("user").value,
        type: "privacy-policy"
      };

      this.privacyService.create(body).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "privacy"]);
          this.dialogService.openSnackBar({
            message: "Data berhasil disimpan"
          });
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formPrivacy);
    }
  }

}
