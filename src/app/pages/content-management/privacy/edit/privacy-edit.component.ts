import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';
import { PrivacyService } from 'app/services/content-management/privacy.service';
import { Option } from 'app/classes/config';

@Component({
  selector: 'app-privacy-edit',
  templateUrl: './privacy-edit.component.html',
  styleUrls: ['./privacy-edit.component.scss']
})
export class PrivacyEditComponent {

  formPrivacy: FormGroup;
  formPrivacyError: any;
  detailPrivacy: any;

  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  files: File;
  public options: Object = Option.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private privacyService: PrivacyService,
    private dataService: DataService
  ) {
    this.formPrivacyError = {
      title: {},
      body: {},
      user: {}
    };

    this.detailPrivacy = this.dataService.getFromStorage('detail_privacy');
  }

  ngOnInit() {
    this.formPrivacy = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      is_notif: [false] 
    });

    this.formPrivacy.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formPrivacy, this.formPrivacyError);
    });

    this.formPrivacy.setValue({
      title: this.detailPrivacy.title,
      user: this.detailPrivacy.user,
      body: this.detailPrivacy.body,
      is_notif: false
    })
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formPrivacy.valid) {
      let body: Object = {
        _method: "PUT",
        title: this.formPrivacy.get("title").value,
        body: this.formPrivacy.get("body").value,
        user: this.formPrivacy.get("user").value,
        type: "privacy-policy",
        is_notif: this.formPrivacy.get('is_notif').value === true ? 1 : 0,
      };

      this.privacyService.put(body, { content_id: this.detailPrivacy.id }).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "privacy"]);
          this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
          window.localStorage.removeItem('detail_privacy');
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
