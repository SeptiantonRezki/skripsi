import { Component, OnInit } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { FormGroup, FormBuilder, Validators } from '../../../../../../node_modules/@angular/forms';
import { Router } from '../../../../../../node_modules/@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { HelpService } from 'app/services/content-management/help.service';
import { DataService } from '../../../../services/data.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-help-edit',
  templateUrl: './help-edit.component.html',
  styleUrls: ['./help-edit.component.scss']
})
export class HelpEditComponent {

  formHelp: FormGroup;
  formHelpError: any;
  detailHelp: any;

  keywordVisible: boolean = true;
  keywordSelectable: boolean = true;
  keywordRemovable: boolean = true;
  keywordAddOnBlur: boolean = true;
  readonly keywordSeparatorKeysCodes: number[] = [ENTER, COMMA];
  keywords: string[] = [];

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
    private helpService: HelpService,
    private dataService: DataService,
  ) {
    this.formHelpError = {
      title: {},
      body: {},
      user: {},
      category: {},
      // otherkeyword: {},
    };

    this.detailHelp = this.dataService.getFromStorage('detail_help');
  }

  ngOnInit() {
    this.formHelp = this.formBuilder.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      user: ["", Validators.required],
      category: ["", Validators.required],
      // otherkeyword: ["", Validators.required]
    });

    this.formHelp.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formHelp, this.formHelpError);
    });

    this.getShow();
    this.getListCategory();
    this.getListUser();

    // this.formHelp.setValue({
    //   title: this.detailHelp.title,
    //   // body: this.detailHelp.body,
    //   user: this.detailHelp.user,
    //   category: this.detailHelp.category,
    //   // otherkeyword: this.detailHelp.otherkeyword
    // })
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add keyword
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(keyword: string): void {
    const index = this.keywords.indexOf(keyword);
    //remove keyword
    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
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

  getShow(){
    this.helpService.getShow(null, { content_id: this.detailHelp.id }).subscribe(
      (res: any) => {
        console.log('getShow', res);
        this.detailHelp.image_url = res.data.image_url;
        this.formHelp.setValue({
          title: res.data.title,
          user: this.detailHelp.user,
          category: res.data.content_category_id,
          // otherkeyword: res.data.keyword,
          body: res.data.body,
        });
        this.keywords = JSON.parse(res.data.keyword);
      },
      err => {
        console.error(err);
      }
    );
  }

  removeImage(): void {
    this.files = undefined;
  }

  submit(): void {
    if (this.formHelp.valid || this.formHelp.valid && this.files && this.files.size < 500000) {
      let body = new FormData();
      body.append('_method', 'PUT');
      body.append('title', this.formHelp.get("title").value);
      body.append('body', this.formHelp.get("body").value);
      body.append('user', this.formHelp.get("user").value);
      body.append('content_category_id', this.formHelp.get("category").value);
      // body.append('keyword', this.formHelp.get("otherkeyword").value);
      body.append('keyword', JSON.stringify(this.keywords));
      body.append('type', 'help');
      body.append('is_notif', '0');
      if (this.files) body.append('image', this.files);

      this.helpService.put(body, { content_id: this.detailHelp.id }).subscribe(
        res => {
          // this.loadingIndicator = false;
          this.router.navigate(["content-management", "help"]);
          this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
          window.localStorage.removeItem('detail_help');
        },
        err => {
          this.dialogService.openSnackBar({ message: err.error.message });
          // this.loadingIndicator = false;
        }
      );
    } else {
      let msg;
      if (this.formHelp.invalid)
        msg = "Silahkan lengkapi data terlebih dahulu!";
        else if (this.files && this.files.size >= 500000)
          msg = "Ukuran icon tidak boleh melebihi 500KB!";

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formHelp);
    }
  }

}
