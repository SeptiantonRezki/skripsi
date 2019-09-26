import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { HelpService } from 'app/services/content-management/help.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-help-create',
  templateUrl: './help-create.component.html',
  styleUrls: ['./help-create.component.scss']
})
export class HelpCreateComponent {

  formHelp: FormGroup;
  formHelpError: any;

  userGroup: any[] = [
    { name: "Please Wait...", value: "" },
  ];

  categoryGroup: any[] = [
    { name: "Please Wait...", value: "" },
  ];

  files: File;
  validComboDrag: Boolean;
  
  public options: Object = Config.FROALA_CONFIG;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private helpService: HelpService
  ) {
    this.formHelpError = {
      title: {},
      body: {},
      user: {},
      category: {},
      otherkeyword: {}
    };
  }

  ngOnInit() {
    this.formHelp = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      category: ["", Validators.required],
      otherkeyword: ["", Validators.required]
    });

    this.formHelp.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formHelp, this.formHelpError);
    });

    this.getListCategory();
    this.getListUser();
  }

  getListCategory() {
    this.helpService.getListCategory().subscribe(
      (res: any) => {
        this.categoryGroup = res.data.map((item: any) => {
          return (
            { name: item.category, value: item.id }
          );
        });
      },
      err => {
        this.categoryGroup = [];
        console.error(err);
      }
    );
  }


  getListUser() {
    this.helpService.getListUser().subscribe(
      (res: any) => {
        console.log('getListUser', res);
        this.userGroup = res.data.map((item: any) => {
          return (
            { name: item, value: item }
          );
        });
      },
      err => {
        this.userGroup = [];
        console.error(err);
      }
    );
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
      body.append('content_category_id', this.formHelp.get("category").value);
      body.append('keyword', this.formHelp.get("otherkeyword").value);
      body.append('is_notif', '0');
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
