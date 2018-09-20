import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { HelpService } from 'app/services/content-management/help.service';

@Component({
  selector: 'app-help-create',
  templateUrl: './help-create.component.html',
  styleUrls: ['./help-create.component.scss']
})
export class HelpCreateComponent {

  formHelp: FormGroup;
  formHelpError: any;

  userGroup: any[] = [
    { name: "Field Force", value: "field-force" },
    { name: "Wholesaler", value: "wholesaler" },
    { name: "Retailer", value: "retailer" },
    // { name: "Paguyuban", value: "paguyuban" },
    { name: "Customer", value: "customer" }
  ];

  files: File;
  validComboDrag: Boolean;
  
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
    private helpService: HelpService
  ) {
    this.formHelpError = {
      title: {},
      body: {},
      user: {}
    };
  }

  ngOnInit() {
    this.formHelp = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required]
    });

    this.formHelp.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formHelp, this.formHelpError);
    });
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formHelp.valid && this.files && this.files.size < 2000000) {
      let body = new FormData();
      body.append('title', this.formHelp.get("title").value);
      body.append('body', this.formHelp.get("body").value);
      body.append('user', this.formHelp.get("user").value);
      body.append('type', 'help');
      body.append('image', this.files);

      this.helpService.create(body).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "help"]);
          this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      let msg;
      if (this.formHelp.invalid)
        msg = "Silakan lengkapi data terlebih dahulu!";
      else if (!this.files)
        msg = "Icon belum dipilih!";
      else if (this.files.size > 2000000)
        msg = "Ukuran icon tidak boleh melebihi 2mb!";

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formHelp);
    }
  }

}
