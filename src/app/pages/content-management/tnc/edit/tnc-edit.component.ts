import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { TncService } from '../../../../services/content-management/tnc.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-tnc-edit',
  templateUrl: './tnc-edit.component.html',
  styleUrls: ['./tnc-edit.component.scss']
})
export class TncEditComponent {

  formTnc: FormGroup;
  formTncError: any;
  detailTnc: any;

  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  files: File;
  public options: Object = {
    key: "mA4B4C1C3vA1E1F1C4B8D7D7E1E5D3ieeD-17A2sF-11==",
    placeholderText: "Isi Konten",
    height: 150,
    quickInsertTags: [""],
    quickInsertButtons: [""],
    imageUpload: false,
    pasteImage: false,
    enter: "ENTER_BR",
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'formatOL', 'formatUL', '|', 'outdent', 'indent', 'clearFormatting', 'insertTable', 'quote'],
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private tncService: TncService,
    private dataService: DataService
  ) {
    this.formTncError = {
      title: {},
      body: {},
      user: {}
    };

    this.detailTnc = this.dataService.getFromStorage('detail_tnc');
  }

  ngOnInit() {
    this.formTnc = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required]
    });

    this.formTnc.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formTnc, this.formTncError);
    });

    this.formTnc.setValue({
      title: this.detailTnc.title,
      user: this.detailTnc.user,
      body: this.detailTnc.body
    })
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formTnc.valid) {
      let body: Object = {
        _method: "PUT",
        title: this.formTnc.get("title").value,
        body: this.formTnc.get("body").value,
        user: this.formTnc.get("user").value,
        type: "terms-conditions"
      };

      this.tncService.put(body, { content_id: this.detailTnc.id }).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "terms-and-condition"]);
          this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
          window.localStorage.removeItem('detail_tnc');
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formTnc);
    }
  }

}
